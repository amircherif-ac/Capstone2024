const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('direct_messages', {
    DM_ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    senderID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'userID'
      }
    },
    recipientID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'userID'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    post_image_path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    message_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    edit_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'direct_messages',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "DM_ID" },
        ]
      },
      {
        name: "senderID",
        using: "BTREE",
        fields: [
          { name: "senderID" },
        ]
      },
      {
        name: "recipientID",
        using: "BTREE",
        fields: [
          { name: "recipientID" },
        ]
      },
    ]
  });
};
