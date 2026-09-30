const { Pool } = require('pg');
const config = require('./env');
const { startupLogger } = require('../logger');

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const initDb = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure role column exists if upgrading
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        END IF;
      END $$;
    `);

    // Ensure there is at least one "Anonyme" user for legacy messages
    const anonResult = await pool.query(`
      INSERT INTO users (username, password_hash) 
      VALUES ('Anonyme', 'legacy-no-login')
      ON CONFLICT (username) DO NOTHING
      RETURNING id
    `);

    let anonId = 1;
    if (anonResult.rows.length > 0) {
      anonId = anonResult.rows[0].id;
    } else {
      const existingAnon = await pool.query(`SELECT id FROM users WHERE username = 'Anonyme'`);
      if (existingAnon.rows.length > 0) anonId = existingAnon.rows[0].id;
    }

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC)`);

    // Migration: Add user_id column if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='messages' AND column_name='user_id') THEN
          ALTER TABLE messages ADD COLUMN user_id INTEGER REFERENCES users(id);
          UPDATE messages SET user_id = ${anonId} WHERE user_id IS NULL;
          ALTER TABLE messages ALTER COLUMN user_id SET NOT NULL;
        END IF;
      END $$;
    `);

    startupLogger.info("Database connected, tables 'users' and 'messages' are ready.");
  } catch (err) {
    startupLogger.error(`Error initializing DB: ${err.message}`);
  }
};

initDb();

module.exports = pool;
