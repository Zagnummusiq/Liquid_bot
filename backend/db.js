const Database = require('better-sqlite3');
const db = new Database('botlife.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS bots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    url TEXT,
    telegram_handle TEXT,
    price REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ad_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id TEXT NOT NULL,
    description TEXT,
    weight INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS sync_tokens (
    token TEXT PRIMARY KEY,
    bot_id INTEGER,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(bot_id) REFERENCES bots(id)
  );

  CREATE TABLE IF NOT EXISTS sync_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(bot_id) REFERENCES bots(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    telegramId INTEGER PRIMARY KEY,
    username TEXT,
    balance INTEGER DEFAULT 0,
    walletAddress TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    reward INTEGER,
    type TEXT,
    link TEXT,
    isActive INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS user_tasks (
    userId INTEGER,
    taskId INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(userId, taskId),
    FOREIGN KEY(userId) REFERENCES users(telegramId),
    FOREIGN KEY(taskId) REFERENCES tasks(id)
  );
`);

// Seed initial data if empty
const botCount = db.prepare('SELECT COUNT(*) as count FROM bots').get();
if (botCount.count === 0) {
  const insertBot = db.prepare('INSERT INTO bots (name, description, category, url, telegram_handle) VALUES (?, ?, ?, ?, ?)');
  insertBot.run("Liquid Luck", "Smart neural engineering for liquid monetization. Integrated with MoneySlash.", "Neural Engineering", "https://t.me/Liquidluck_bot/moneyslash", "Liquidluck_bot");
  insertBot.run("Display Bot Alpha", "High-frequency ad display bot for maximum impressions and smart routing.", "Display Bots", null, "Botlife_Alpha_bot");
  insertBot.run("AdGuard Pro", "Advanced display ad optimization and verification system.", "Display Ads", null, "AdGuard_Pro_bot");
  insertBot.run("Neural Nexus", "Core brain for neural engineering systems and bot orchestration.", "Neural Engineering", null, "NeuralNexus_bot");
  insertBot.run("Quantum Query", "Hyper-fast data retrieval and analysis using quantum-inspired algorithms.", "Data Systems", null, "QuantumQuery_bot");
  insertBot.run("Cyber Sentinel", "Proactive threat detection and neutralizing system for bot networks.", "Security", null, "CyberSentinel_bot");
  insertBot.run("Sync Master", "Global synchronization hub for cross-platform bot deployments.", "Infrastructure", null, "SyncMaster_bot");
  insertBot.run("Meta Miner", "Efficient metadata extraction and categorization engine for large bot arrays.", "Data Systems", null, "MetaMiner_bot");

  const insertLink = db.prepare('INSERT INTO ad_links (link_id, description) VALUES (?, ?)');
  const links = [
    ['8984644', 'Terrific'], ['9611956', 'Positive'], ['9181340', 'Light'],
    ['8929450', 'Positive'], ['8109845', 'Efficient'], ['9610697', 'Pungent'],
    ['9611854', 'Strong'], ['9022048', 'Wise'], ['9135943', 'Industrious'],
    ['8348809', 'Beautiful'], ['8929419', 'Immortal'], ['8984539', 'Good'],
    ['9126522', 'Strong'], ['8109847', 'Skillful'], ['8939304', 'Hot'],
    ['8109846', 'Fabulous'], ['8111059', 'Rich'], ['9003389', 'Sharp-witted']
  ];
  links.forEach(link => insertLink.run(link[0], link[1]));

  const insertTask = db.prepare('INSERT INTO tasks (title, description, reward, type, link) VALUES (?, ?, ?, ?, ?)');
  insertTask.run('Daily Check-in', 'Log in every day to earn points.', 50, 'daily', null);
  insertTask.run('Follow Telegram Channel', 'Join our official channel for updates.', 200, 'social', 'https://t.me/botlife_official');
  insertTask.run('Follow on Twitter/X', 'Follow us on X for the latest news.', 150, 'social', 'https://x.com/botlife');
  insertTask.run('Watch Neural Stream', 'Engage with the neural stream for 1 minute.', 100, 'ad', null);
  insertTask.run('Connect TON Wallet', 'Link your Tonkeeper wallet to become eligible for prizes.', 500, 'social', null);
}

module.exports = db;
