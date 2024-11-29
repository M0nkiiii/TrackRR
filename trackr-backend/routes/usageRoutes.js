const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const UsageData = require('../models/UsageData');
const { Sequelize } = require('sequelize');
const { getUsageData, updateUsageData, getWeeklyUsage, getDailyUsage, triggerPrediction } = require('../controllers/usageController');
const { protect } = require('../middleware/authMiddleware');


// Route to track screen usage
router.post('/track', authenticateToken, async (req, res) => {
    try {
        const { appName, duration } = req.body;

        if (!appName || !duration) {
            return res.status(400).json({ error: 'App name and duration are required' });
        }

        const userId = req.user.id;

        const usageRecord = await UsageData.create({
            userId,
            appName,
            duration,
        });

        res.status(201).json({ message: 'Usage tracked successfully', usageRecord });
    } catch (error) {
        console.error(`Error tracking usage for user:`, error.message);
        res.status(500).json({ error: 'Failed to track usage' });
    }
});

// Route to fetch dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching dashboard data for user:', userId);

        const totalScreenTime = await UsageData.sum('duration', { where: { userId } });
        const appUsage = await UsageData.findAll({
            where: { userId },
            attributes: [
                'appName',
                [Sequelize.fn('SUM', Sequelize.col('duration')), 'totalTime'],
            ],
            group: ['appName'],
            order: [[Sequelize.literal('totalTime'), 'DESC']],
        });

        res.status(200).json({ totalScreenTime, appUsage });
    } catch (error) {
        console.error(`Error fetching dashboard data for user ${userId}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});


//fetch weekly usage data 


// Route to get usage data
router.get('/usage', getUsageData); // Make sure 'getUsageData' is defined

// Route to update usage data
router.put('/usage', updateUsageData); // Make sure 'updateUsageData' is defined

// Weekly usage route
router.get('/weekly/:userId', authenticateToken, getWeeklyUsage);

// Route to fetch daily usage
router.get('/daily/:userId', authenticateToken, getDailyUsage);

// Route to trigger prediction
router.get('/predict/:userId', authenticateToken, triggerPrediction);




module.exports = router;
