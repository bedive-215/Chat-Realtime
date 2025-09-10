import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Friend = sequelize.define('Friend', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    requester_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: { 
      type: DataTypes.ENUM('pending', 'accepted', 'declined', 'blocked'),
      defaultValue: 'pending',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'friends',
    timestamps: false,
  });

  return Friend;
};
