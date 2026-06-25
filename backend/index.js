require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Botlife API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'Botlife Systems Online', timestamp: new Date() });
});

app.post('/verify-bot', (req, res) => {
  const { botToken } = req.body;
  // Simple verification logic
  if (botToken === process.env.TELEGRAM_BOT_TOKEN) {
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
