const express = require('express');
const sanitizeHtml = require('sanitize-html');
const pool = require('../config/db');
const { appLogger } = require('../logger');
const authMiddleware = require('../middleware/auth');

module.exports = (io) => {
  const router = express.Router();

  /**
   * @swagger
   * components:
   *   schemas:
   *     Message:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *         content:
   *           type: string
   *         user_id:
   *           type: integer
   *         username:
   *           type: string
   *         created_at:
   *           type: string
   *           format: date-time
   */

  /**
   * @swagger
   * /api/messages:
   *   get:
   *     summary: Récupérer tous les messages
   *     tags: [Messages]
   */
  router.get('/', authMiddleware, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    try {
      const result = await pool.query(`
        SELECT m.*, u.username
        FROM messages m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      appLogger.info(`Fetched ${result.rowCount} messages (limit=${limit}, offset=${offset})`);
      res.json(result.rows);
    } catch (err) {
      appLogger.error(`Error fetching messages: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/messages:
   *   post:
   *     summary: Créer un nouveau message (Requiert Auth)
   *     tags: [Messages]
   */
  router.post('/', authMiddleware, async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be text' });
    }

    const cleanContent = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }).trim();
    if (!cleanContent) {
      return res.status(400).json({ error: 'Content cannot be empty after sanitization' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO messages (content, user_id) VALUES ($1, $2) RETURNING *', 
        [cleanContent, userId]
      );
      
      const newMessage = { ...result.rows[0], username: req.user.username };
      appLogger.info(`Message created with ID: ${newMessage.id} by User ID: ${userId}`);
      
      io.emit('message_created', newMessage);
      res.status(201).json(newMessage);
    } catch (err) {
      appLogger.error(`Error creating message: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/messages/{id}:
   *   put:
   *     summary: Modifier un message existant (Requiert d'être l'auteur)
   *     tags: [Messages]
   */
  router.put('/:id', authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required and must be text' });
    }

    const cleanContent = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }).trim();
    if (!cleanContent) return res.status(400).json({ error: 'Content cannot be empty' });

    try {
      const checkOwnership = await pool.query('SELECT user_id FROM messages WHERE id = $1', [id]);
      if (checkOwnership.rows.length === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }
      if (checkOwnership.rows[0].user_id !== userId && userRole !== 'admin') {
        appLogger.warn(`User ${userId} attempted to modify message ${id} without admin privileges.`);
        return res.status(403).json({ error: 'Forbidden. You are not the author or admin.' });
      }

      const result = await pool.query(
        'UPDATE messages SET content = $1 WHERE id = $2 RETURNING *', 
        [cleanContent, id]
      );
      
      const updatedMessage = { ...result.rows[0] };
      appLogger.info(`Message updated with ID: ${id} by ${userRole === 'admin' ? 'Admin' : 'User'}`);
      
      io.emit('message_updated', updatedMessage);
      res.json(updatedMessage);
    } catch (err) {
      appLogger.error(`Error updating message: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * @swagger
   * /api/messages/{id}:
   *   delete:
   *     summary: Supprimer un message (Requiert d'être l'auteur ou admin)
   *     tags: [Messages]
   */
  router.delete('/:id', authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
      const checkOwnership = await pool.query('SELECT user_id FROM messages WHERE id = $1', [id]);
      if (checkOwnership.rows.length === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }
      if (checkOwnership.rows[0].user_id !== userId && userRole !== 'admin') {
        appLogger.warn(`User ${userId} attempted to delete message ${id} without admin privileges.`);
        return res.status(403).json({ error: 'Forbidden. You are not the author or admin.' });
      }

      await pool.query('DELETE FROM messages WHERE id = $1', [id]);
      appLogger.info(`Message deleted with ID: ${id} by ${userRole === 'admin' ? 'Admin' : 'User'}`);
      
      io.emit('message_deleted', { id: parseInt(id) });
      res.json({ success: true, message: 'Message deleted' });
    } catch (err) {
      appLogger.error(`Error deleting message: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
