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
        allowNull: true,
        references: {
          model: 'users',
          key: 'userID'
        }
      },
    timeSpentLog: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true
    }
  //   }, {
  //   sequelize,
  //   tableName: 'timespent',
  //   timestamps: false,
  //   indexes: [
  //     {
  //       name: "PRIMARY",
  //       unique: true,
  //       using: "BTREE",
  //       fields: [
  //         { name: "logID" },
  //       ]
  //     },
  //     {
  //       name: "userID",
  //       using: "BTREE",
  //       fields: [
  //         { name: "userID" },
  //       ]
  //     },
  //     {
  //       name: "timeSpentLog",
  //       using: "BTREE",
  //       fields: [
  //         { name: "timeSpentLog" },
  //       ]
  //     },
  //     {
  //       name: "date",
  //       using: "BTREE",
  //       fields: [
  //         { name: "date" },
  //       ]
  //     }
  //   ]
  // 
});
};
