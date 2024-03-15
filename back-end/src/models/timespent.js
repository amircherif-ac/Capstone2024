const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('timespent', {
    logID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userID'
      }
    },
    timeSpentLog: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
  },{
    sequelize,
    tableName: 'timespent',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "logID" },
        ]
      },
      {
        name: "userID",
        unique: false,
        using: "BTREE",
        fields: [
          { name: "userID" },
        ]
      },
    ]
  });
};
