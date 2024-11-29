const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Goal = sequelize.define('Goal', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    goalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    targetTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Goal;
