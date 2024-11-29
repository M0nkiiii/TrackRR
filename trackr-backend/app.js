const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db'); // Assuming Sequelize is being used
const authRoutes = require('./routes/authRoutes');
const usageRoutes = require('./routes/usageRoutes');
const goalRoutes = require('./routes/goalRoutes'); // Adjust the path if necessary
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');

dotenv.config(); // Load environment variables

const app = express();

// Enable CORS for all origins
app.use(cors());

// Body parser to parse JSON request bodies
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/usage', usageRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Port Configuration
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, async () => {
    try {
        await sequelize.sync(); // Sync database using Sequelize
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error('Failed to connect to database:', error.message);
    }
});
