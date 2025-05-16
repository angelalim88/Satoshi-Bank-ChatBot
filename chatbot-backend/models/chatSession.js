const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatSession = sequelize.define(
  'ChatSession',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    topic:{
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'chat_sessions',
    timestamps: false,
  }
);

module.exports = ChatSession;