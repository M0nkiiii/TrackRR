const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const Goal = require('../models/Goal'); // Ensure this model exists

/**
 * Add a new goal for the authenticated user.
 */
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { goalName, description, targetTime } = req.body;

        // Validate the required fields
        if (!goalName || !targetTime) {
            return res.status(400).json({ error: 'Goal name and target time are required.' });
        }

        const userId = req.user.id; // Extract the user ID from the token
        const newGoal = await Goal.create({
            userId,
            goalName,
            description,
            targetTime: new Date(targetTime),
        });

        res.status(201).json({ message: 'Goal added successfully', goal: newGoal });
    } catch (error) {
        console.error('Error adding goal:', error.message);
        res.status(500).json({ error: 'Failed to add goal' });
    }
});

/**
 * Fetch all goals for the authenticated user.
 */
router.get('/user-goals', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from the token

        // Fetch all goals for the user and include `createdAt` in the response
        const goals = await Goal.findAll({
            where: { userId },
            attributes: ['id', 'goalName', 'description', 'targetTime', 'createdAt'], // Explicitly include createdAt
        });

        res.status(200).json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error.message);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

/**
 * Update an existing goal for the authenticated user.
 */
router.put('/update/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { goalName, description, targetTime } = req.body;

        // Validate the required fields
        if (!goalName || !targetTime) {
            return res.status(400).json({ error: 'Goal name and target time are required.' });
        }

        const userId = req.user.id; // Extract user ID from the token

        // Find and update the goal
        const goal = await Goal.findOne({ where: { id, userId } });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found.' });
        }

        goal.goalName = goalName;
        goal.description = description || goal.description;
        goal.targetTime = new Date(targetTime);
        await goal.save();

        res.status(200).json({ message: 'Goal updated successfully', goal });
    } catch (error) {
        console.error('Error updating goal:', error.message);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

/**
 * Delete a goal for the authenticated user.
 */
router.delete('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Extract user ID from the token

        // Find and delete the goal
        const goal = await Goal.findOne({ where: { id, userId } });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found.' });
        }

        await goal.destroy();

        res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error.message);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

module.exports = router;
