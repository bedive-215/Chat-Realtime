import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ChatParticipant = sequelize.define('ChatParticipant', {
    chat_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'chat_participants',
    timestamps: false,
  });

  return ChatParticipant;
};
