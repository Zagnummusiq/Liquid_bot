require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { status: 'Neural Overload', message: 'Too many requests, please wait.' }
});

app.use(limiter);
app.use(cors());
app.use(express.json());

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

// Render Deployment Catch-all
app.get('/', (req, res) => {
  res.send('Botlife Backend API is Running.');
});

app.listen(PORT, () => {
  console.log(`Botlife Backend running on port ${PORT}`);
});
