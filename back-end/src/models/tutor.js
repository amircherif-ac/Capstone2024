const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tutor', {
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'userID'
      }
    },
    courseID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'courses',
        key: 'courseID'
      }
    }
  }, {
    sequelize,
    tableName: 'tutor',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userID" },
          { name: "courseID" },
        ]
      },
      {
        name: "tutor_userID_courseID_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userID" },
          { name: "courseID" },
        ]
      },
      {
        name: "courseID",
        using: "BTREE",
        fields: [
          { name: "courseID" },
        ]
      },
    ]
  });
};
