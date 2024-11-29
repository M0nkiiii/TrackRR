const { Op } = require('sequelize'); 
const UsageData = require('../models/UsageData');
const sequelize = require('../config/db');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const WeeklyUsage = require("../models/WeeklyUsage"); // Adjust based on your project structure

// Track screen usage
const trackScreenUsage = async (req, res) => {
    try {
        const { appName, duration } = req.body;
        const userId = req.user.id;

        if (!userId || !appName || !duration) {
            return res.status(400).json({ error: 'Invalid data provided.' });
        }

        const usageRecord = await UsageData.create({
            userId,
            appName,
            duration,
            timestamp: new Date(),
        });

        res.status(201).json({ message: 'Usage tracked successfully', usageRecord });
    } catch (error) {
        console.error('Error tracking usage:', error.message);
        res.status(500).json({ error: 'Failed to track usage' });
    }
};

// Fetch dashboard data
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

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
        console.error('Error fetching dashboard data:', error.message);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

// Controller to get usage data
const getUsageData = asyncHandler(async (req, res) => {
    const usageData = await Usage.find(); // Replace with your specific query
    if (!usageData) {
      res.status(404);
      throw new Error('Usage data not found');
    }
    res.status(200).json(usageData);
  });
  
  // Controller to update usage data
  const updateUsageData = asyncHandler(async (req, res) => {
    const { id, updatedField } = req.body;
  
    const usageData = await Usage.findById(id);
    if (!usageData) {
      res.status(404);
      throw new Error('Usage data not found');
    }
  
    usageData.updatedField = updatedField || usageData.updatedField;
  
    const updatedData = await usageData.save();
    res.status(200).json(updatedData);
  });

  // Fetch weekly usage for a user
  const getWeeklyUsage = async (req, res) => {
    try {
        const userId = req.params.userId; // Make sure the userId is being passed correctly
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch weekly usage for the user
        const weeklyData = await WeeklyUsage.findAll({
            where: { userId },
            attributes: [
                [sequelize.fn('DAYNAME', sequelize.col('date')), 'day'], // Day name
                [sequelize.fn('SUM', sequelize.col('usageDuration')), 'totalUsage'], // Sum of usage
            ],
            group: ['date'],
            order: [['date', 'ASC']], // Order by date
        });

        if (!weeklyData.length) {
            return res.status(404).json({ error: 'No weekly usage data found' });
        }

        res.status(200).json(weeklyData);
    } catch (error) {
        console.error('Error fetching weekly usage:', error.message);
        res.status(500).json({ error: 'Failed to fetch weekly usage' });
    }
};

// Fetch daily usage
const getDailyUsage = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch daily usage data for the user
        const dailyUsage = await UsageData.findAll({
            where: {
                userId,
                timestamp: {
                    [Op.between]: [startOfDay, endOfDay],
                },
            },
            attributes: ['appName', 'duration'],
        });

        // Return empty usage if no data is found
        if (!dailyUsage || dailyUsage.length === 0) {
            return res.status(200).json({
                totalUsageMinutes: 0,
                dailyUsage: [],
                recommendation: 'No usage data recorded for today. Consider tracking your screen time.',
            });
        }

        // Calculate total usage in minutes
        const totalUsageMinutes = dailyUsage.reduce((sum, usage) => sum + usage.duration, 0) / 60;

        res.status(200).json({
            totalUsageMinutes,
            dailyUsage,
            recommendation: 'Try to limit your screen time to 2 hours per day.',
        });
    } catch (error) {
        console.error('Error fetching daily usage:', error.message);
        res.status(500).json({ error: 'Failed to fetch daily usage' });
    }
};

// Trigger prediction
const triggerPrediction = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const usageData = await UsageData.findAll({
            where: {
                userId,
                timestamp: {
                    [Op.gte]: oneWeekAgo,
                },
            },
            attributes: ['appName', 'duration'],
        });

        if (!usageData || usageData.length === 0) {
            return res.status(200).json({
                message: 'No usage data available yet. Keep using the app to gather data for predictions.',
                predictedUsageMinutes: null,
                recommendation: null,
            });
        }

        const totalUsage = usageData.reduce((sum, usage) => sum + usage.duration, 0);
        const predictedUsage = totalUsage / 7;

        const recommendation =
            predictedUsage > 120
                ? 'Consider reducing your screen time to avoid overuse.'
                : 'Your usage is within a healthy range. Keep it up!';

        res.status(200).json({
            predictedUsageMinutes: predictedUsage.toFixed(2),
            recommendation,
        });
    } catch (error) {
        console.error('Error triggering prediction:', error.message);
        res.status(500).json({ error: 'Failed to trigger prediction' });
    }
};



module.exports = { trackScreenUsage, getUserDashboardData, getUsageData,
 updateUsageData,getWeeklyUsage, getDailyUsage, triggerPrediction };
