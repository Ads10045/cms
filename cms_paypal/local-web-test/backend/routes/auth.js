const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const config = require('../config/env');
const { appLogger } = require('../logger');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: 'Username (min 3) and password (min 6) required.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, password_hash, 'user']
    );

    const user = result.rows[0];
    appLogger.info(`New user registered: ${username} (Role: ${user.role})`);
    
    // Auto-login after register
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.security.jwtSecret, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProd || config.isRecette || config.isIntegration,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Username already exists' });
    }
    appLogger.error(`Registration error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connecté avec succès
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.security.jwtSecret, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProd || config.isRecette || config.isIntegration,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    appLogger.info(`User logged in: ${username} (Role: ${user.role})`);
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    appLogger.error(`Login error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnecté avec succès
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtenir l'utilisateur actuel
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

module.exports = router;
