const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    taskName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

module.exports = Task;
