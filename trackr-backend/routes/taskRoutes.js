const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Task = require('../models/Task'); // Sequelize model for tasks

// Add a new task
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { taskName, description, date } = req.body;
        const userId = req.user.id;

        const newTask = await Task.create({
            userId,
            taskName,
            description,
            date,
        });

        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error adding task:', error.message);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// Fetch tasks for a specific user
router.get('/user-tasks', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.findAll({ where: { userId } });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

module.exports = router;
