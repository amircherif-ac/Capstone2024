const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('meeting_guest', {
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'userID'
      }
    },
    eventID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'calendar',
        key: 'eventID'
      }
    }
  }, {
    sequelize,
    tableName: 'meeting_guest',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userID" },
          { name: "eventID" },
        ]
      },
      {
        name: "meeting_guest_userID_eventID_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userID" },
          { name: "eventID" },
        ]
      },
      {
        name: "eventID",
        using: "BTREE",
        fields: [
          { name: "eventID" },
        ]
      },
    ]
  });
};
