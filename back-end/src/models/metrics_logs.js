const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('metrics_logs', {
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
    metrixID: {
        // ID 1 for "Time Spent", 2 for "Seesion attended", 3 for "Assessment grade" and 4 for "Engagement Level"
        type: DataTypes.INTEGER,
        allowNull: false
    },
    logdate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    val: {
      // value of the metric. E.g. 1.5 hours, 2 sessions, 80% grade, 3.5.
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },{
    sequelize,
    tableName: 'metrics_logs',
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
