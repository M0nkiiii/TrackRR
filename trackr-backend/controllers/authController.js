const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Register User
const registerUser = async (req, res) => {
    const { username, email, password, phoneNumber, profilePicture } = req.body;
  
    console.log('Registering User:', { username, email, phoneNumber });
  
    let savedProfilePicture = null;
    if (profilePicture) {
      try {
        // Decode Base64 and save the image
        const base64Data = profilePicture.replace(/^data:image\/\w+;base64,/, '');
        const fileName = `profile_${Date.now()}.jpg`;
        const filePath = path.join('uploads', fileName);
  
        if (!fs.existsSync('uploads')) {
          fs.mkdirSync('uploads');
        }
  
        fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
        savedProfilePicture = `/uploads/${fileName}`;
      } catch (error) {
        console.error('Error saving profile picture:', error.message);
        return res.status(500).json({ error: 'Failed to save profile picture' });
      }
    }
  
    try {
      if (!username || !email || !password) {
        console.error('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        profilePicture: savedProfilePicture,
      });
  
      console.log('User registered successfully:', newUser);
  
      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      console.error('Error during registration:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log('Logging in user:', email);

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Invalid credentials');
      return res.status(403).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('User logged in successfully:', { userId: user.id });

    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Get User Details
const getUserDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.error('User ID is missing from the request');
      return res.status(400).json({ error: 'User ID is missing' });
    }

    console.log(`Fetching user details for ID: ${userId}`);

    const user = await User.findByPk(userId);
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User details fetched successfully:', user);

    res.status(200).json({ id: user.id, email: user.email, name: user.username });
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

// Get User Info
const getUserInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['username', 'email', 'phoneNumber', 'profilePicture'],
    });

    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User info fetched successfully:', user);

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
};

// Update User Info
const updateUserInfo = async (req, res) => {
  const { username, phoneNumber, profilePicture } = req.body;

  console.log('Updating user info:', { username, phoneNumber, profilePicture });

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    console.log('User info updated successfully:', user);

    res.status(200).json({ message: 'User info updated successfully', user });
  } catch (error) {
    console.error('Error updating user info:', error.message);
    res.status(500).json({ message: 'Failed to update user info' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserDetails,
  getUserInfo,
  updateUserInfo,

};
