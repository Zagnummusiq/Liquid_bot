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

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Telegram Bot Setup
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply('Botlife Telegram Mini App Bot Online!'));
bot.launch();

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

// Network Stats
app.get('/api/stats', (req, res) => {
  try {
    const totalSyncs = db.prepare('SELECT COUNT(*) as count FROM sync_history').get().count;
    const botCount = db.prepare('SELECT COUNT(*) as count FROM bots').get().count;
    const recentSyncs = db.prepare('SELECT bots.name, sync_history.timestamp FROM sync_history JOIN bots ON sync_history.bot_id = bots.id ORDER BY timestamp DESC LIMIT 5').all();
    
    res.json({
      totalSyncs: totalSyncs + 1240, // Base offset for social proof
      botCount,
      activeNodes: Math.floor(Math.random() * 50) + 150,
      recentSyncs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Pexels Video Proxy
app.get('/api/neural-stream', async (req, res) => {
  const queries = ['neural network', 'cyberpunk city', 'robotics', 'futuristic technology', 'digital brain'];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  try {
    const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(randomQuery)}&per_page=15&orientation=portrait`, {
      headers: {
        'Authorization': process.env.PEXELS_API_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Simplify data for frontend and ensure we get a valid mp4 link
      const videos = data.videos.map(v => {
        const file = v.video_files.find(f => f.file_type === 'video/mp4' && (f.quality === 'sd' || f.quality === 'hd')) || v.video_files[0];
        return {
          id: v.id,
          url: file?.link,
          image: v.image,
          user: v.user.name
        };
      }).filter(v => v.url); // Remove any that didn't find a link
      
      res.json(videos);
    } else {
      res.status(response.status).json({ error: 'Pexels API error' });
    }
  } catch (error) {
    console.error('Pexels proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Unsplash Image Proxy
app.get('/api/neural-images', async (req, res) => {
  const queries = ['neural engineering', 'futuristic tech', 'cyberpunk', 'artificial intelligence'];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(randomQuery)}&count=10`, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const images = data.map(img => ({
        id: img.id,
        url: img.urls.regular,
        user: img.user.name,
        description: img.description || img.alt_description
      }));
      res.json(images);
    } else {
      res.status(response.status).json({ error: 'Unsplash API error' });
    }
  } catch (error) {
    console.error('Unsplash proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Botlife Backend running on port ${PORT}`);
});
