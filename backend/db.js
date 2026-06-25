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
    price REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ad_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id TEXT NOT NULL,
    description TEXT,
    weight INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS sync_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(bot_id) REFERENCES bots(id)
  );
`);

// Seed initial data if empty
const botCount = db.prepare('SELECT COUNT(*) as count FROM bots').get();
if (botCount.count === 0) {
  const insertBot = db.prepare('INSERT INTO bots (name, description, category, url) VALUES (?, ?, ?, ?)');
  insertBot.run("Liquid Luck", "Smart neural engineering for liquid monetization. Integrated with MoneySlash.", "Neural Engineering", "https://t.me/Liquidluck_bot/moneyslash");
  insertBot.run("Display Bot Alpha", "High-frequency ad display bot for maximum impressions and smart routing.", "Display Bots", null);
  insertBot.run("AdGuard Pro", "Advanced display ad optimization and verification system.", "Display Ads", null);
  insertBot.run("Neural Nexus", "Core brain for neural engineering systems and bot orchestration.", "Neural Engineering", null);

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
}

module.exports = db;
