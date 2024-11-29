const express = require('express');
const {
  registerUser,
  loginUser,
  getUserDetails,
  getUserInfo,
  updateUserInfo,
  upload,
} = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/register', registerUser); // No multer middleware
router.post('/login', loginUser);
router.get('/me', authenticateToken, getUserDetails);
router.get('/user', authenticateToken, getUserInfo);
router.put('/user', authenticateToken, updateUserInfo);

module.exports = router;
