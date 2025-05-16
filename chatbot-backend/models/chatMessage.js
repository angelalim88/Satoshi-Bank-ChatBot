const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define(
  'ChatMessage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chat_sessions',
        key: 'id',
      },
    },
    sender: {
      type: DataTypes.ENUM('user', 'bot'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'chat_messages',
    timestamps: false,
  }
);

module.exports = ChatMessage;