require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const cron = require('node-cron');
const User = require('./models/User');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3001;

// Helper to get user from Mongo or SQLite
async function getOrSyncUser(telegramId, username) {
  if (mongoose.connection.readyState === 1) {
    try {
      let user = await User.findOne({ telegramId });
      if (!user) {
        user = new User({ telegramId, username });
        await user.save();
      }
      return { source: 'mongo', data: user };
    } catch (e) {
      console.warn('Mongo user fetch failed, falling back to SQLite');
    }
  }
  
  // SQLite Fallback
  let user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId);
  if (!user) {
    db.prepare('INSERT INTO users (telegramId, username) VALUES (?, ?)').run(telegramId, username || 'Anonymous');
    user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId);
  }
  return { source: 'sqlite', data: user };
}

// MongoDB Connection
if (process.env.MONGO_URI) {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout
  })
    .then(async () => {
      console.log('Connected to MongoDB successfully');
      // Seed tasks if empty
      const taskCount = await Task.countDocuments();
      console.log(`Current task count: ${taskCount}`);
      if (taskCount === 0) {
        console.log('Seeding initial tasks...');
        const initialTasks = [
          { title: 'Daily Check-in', description: 'Log in every day to earn points.', reward: 50, type: 'daily' },
          { title: 'Follow Telegram Channel', description: 'Join our official channel for updates.', reward: 200, type: 'social', link: 'https://t.me/botlife_official' },
          { title: 'Follow on Twitter/X', description: 'Follow us on X for the latest news.', reward: 150, type: 'social', link: 'https://x.com/botlife' },
          { title: 'Watch Neural Stream', description: 'Engage with the neural stream for 1 minute.', reward: 100, type: 'ad' }
        ];
        await Task.insertMany(initialTasks);
        console.log('Initial tasks seeded successfully');
      }
    })
    .catch((err) => {
      console.error('MongoDB connection error details:', err.message);
      console.error('Stack:', err.stack);
    });
} else {
  console.log('MONGO_URI not found, skipping MongoDB connection (using SQLite only)');
}

// Telegram Bot Setup
const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
if (botToken) {
  const bot = new Telegraf(botToken);
  
  bot.start(async (ctx) => {
    const { id, username, first_name } = ctx.from;
    const result = await getOrSyncUser(id, username || first_name);
    ctx.reply(`Welcome back to Botlife, ${first_name}! Your neural profile is ${result.source === 'mongo' ? 'synced with the cloud' : 'stored locally'}. Balance: ${result.data.balance || result.data.balance === 0 ? result.data.balance : 0} BP.`);
  });

  bot.command('balance', async (ctx) => {
    const result = await getOrSyncUser(ctx.from.id);
    ctx.reply(`Your current balance: ${result.data.balance} Botlife Points (${result.source})`);
  });

  bot.launch().catch(err => console.error('Telegram bot failed to launch:', err));
} else {
  console.log('TELEGRAM_BOT_TOKEN not found, Telegram bot disabled');
}

// Node-Cron Example (Runs every day at 00:00)
cron.schedule('0 0 * * *', () => {
  console.log('Running daily Botlife sync task...');
  // Add sync logic here
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { status: 'Neural Overload', message: 'Too many requests, please wait.' }
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Botlife API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'Botlife Systems Online', timestamp: new Date() });
});

// Get all bots from DB
app.get('/api/bots', (req, res) => {
  try {
    const bots = db.prepare('SELECT * FROM bots').all();
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bots' });
  }
});

// Get monetization links
app.get('/api/monetization/links', (req, res) => {
  try {
    const links = db.prepare('SELECT link_id FROM ad_links').all();
    res.json(links.map(l => l.link_id));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Get all available tasks for a user
app.get('/api/tasks/:telegramId', async (req, res) => {
  const { telegramId } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ telegramId });
      const tasks = await Task.find({ isActive: true });
      const completedTaskIds = user ? user.completedTasks.map(id => id.toString()) : [];
      
      return res.json(tasks.map(task => ({
        ...task.toObject(),
        isCompleted: completedTaskIds.includes(task._id.toString())
      })));
    }
  } catch (error) {
    console.warn('Mongo tasks fetch failed, falling back to SQLite');
  }

  // SQLite Fallback
  const tasks = db.prepare('SELECT * FROM tasks WHERE isActive = 1').all();
  const completedTasks = db.prepare('SELECT taskId FROM user_tasks WHERE userId = ?').all(telegramId);
  const completedTaskIds = completedTasks.map(t => t.taskId);

  res.json(tasks.map(task => ({
    _id: task.id.toString(),
    ...task,
    isCompleted: completedTaskIds.includes(task.id)
  })));
});

// Complete a task
app.post('/api/tasks/complete', async (req, res) => {
  const { telegramId, taskId } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ telegramId });
      if (!user) {
        user = new User({ telegramId });
        await user.save();
      }

      if (user.completedTasks.includes(taskId)) {
        return res.status(400).json({ error: 'Task already completed' });
      }

      const task = await Task.findById(taskId);
      if (task) {
        user.completedTasks.push(taskId);
        user.balance += task.reward;
        await user.save();
        return res.json({ success: true, newBalance: user.balance, source: 'mongo' });
      }
    }
  } catch (error) {
    console.warn('Mongo task completion failed, falling back to SQLite');
  }

  // SQLite Fallback
  try {
    let user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId);
    if (!user) {
      db.prepare('INSERT INTO users (telegramId) VALUES (?)').run(telegramId);
      user = db.prepare('SELECT * FROM users WHERE telegramId = ?').get(telegramId);
    }

    const taskIdInt = parseInt(taskId);
    const alreadyCompleted = db.prepare('SELECT 1 FROM user_tasks WHERE userId = ? AND taskId = ?').get(telegramId, taskIdInt);
    if (alreadyCompleted) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskIdInt);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('INSERT INTO user_tasks (userId, taskId) VALUES (?, ?)').run(telegramId, taskIdInt);
    db.prepare('UPDATE users SET balance = balance + ? WHERE telegramId = ?').run(task.reward, telegramId);
    
    const updatedUser = db.prepare('SELECT balance FROM users WHERE telegramId = ?').get(telegramId);
    res.json({ success: true, newBalance: updatedUser.balance, source: 'sqlite' });
  } catch (error) {
    console.error('SQLite completion error:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Get user profile
app.get('/api/user/profile/:telegramId', async (req, res) => {
  const { telegramId } = req.params;
  const result = await getOrSyncUser(telegramId);
  res.json(result.data);
});

// Update the Network Stats to include real MongoDB data if available
app.get('/api/stats', async (req, res) => {
  try {
    const totalSyncs = db.prepare('SELECT COUNT(*) as count FROM sync_history').get().count;
    const botCount = db.prepare('SELECT COUNT(*) as count FROM bots').get().count;
    const recentSyncs = db.prepare('SELECT bots.name, sync_history.timestamp FROM sync_history JOIN bots ON sync_history.bot_id = bots.id ORDER BY timestamp DESC LIMIT 5').all();
    
    // Get total users from MongoDB
    const userCount = await User.countDocuments() || 0;
    
    res.json({
      totalSyncs: totalSyncs + 1240, 
      botCount,
      activeNodes: Math.floor(Math.random() * 50) + 150 + userCount,
      recentSyncs,
      userCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Generate a sync token after ad completion
app.post('/api/generate-sync-token', (req, res) => {
  const { botId } = req.body;
  const token = crypto.randomBytes(16).toString('hex');
  
  try {
    db.prepare('INSERT INTO sync_tokens (token, bot_id) VALUES (?, ?)').run(token, botId);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sync token' });
  }
});

// Verify sync token (called by Telegram Bot)
app.get('/api/verify-sync/:token', (req, res) => {
  const { token } = req.params;
  
  try {
    const sync = db.prepare('SELECT * FROM sync_tokens WHERE token = ? AND used = 0').get(token);
    
    if (sync) {
      // Mark token as used
      db.prepare('UPDATE sync_tokens SET used = 1 WHERE token = ?').run(token);
      res.json({ verified: true, botId: sync.bot_id });
    } else {
      res.status(404).json({ verified: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error during verification' });
  }
});

app.post('/verify-bot', (req, res) => {
  const { botToken, botId } = req.body;
  
  if (botToken === process.env.TELEGRAM_BOT_TOKEN) {
    if (botId) {
      db.prepare('INSERT INTO sync_history (bot_id) VALUES (?)').run(botId);
    }
    res.json({ verified: true, message: 'Bot Neural Connection Established' });
  } else {
    res.status(401).json({ verified: false, message: 'Neural Sync Failed' });
  }
});

// For any request that doesn't match one above, send back React's index.html file
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Botlife Backend running on port ${PORT}`);
});
