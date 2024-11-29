const express = require('express');
const router = express.Router();
const { createNotification, getUserNotifications, markAsRead } = require('../controllers/notificationController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/add', authenticateToken, createNotification);
router.get('/user-notifications', authenticateToken, getUserNotifications);
router.put('/mark-as-read', authenticateToken, markAsRead);

module.exports = router;
