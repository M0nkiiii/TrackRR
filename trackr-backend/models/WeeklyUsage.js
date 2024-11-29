const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WeeklyUsage = sequelize.define('weeklyusage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    usageDuration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
}, {
    tableName: 'weeklyusage', // Matches your database table name
});

module.exports = WeeklyUsage;
