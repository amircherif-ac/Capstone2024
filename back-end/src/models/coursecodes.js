const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('coursecodes', {
    courseCodeID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    courseCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: "courseCode"
    }
  }, {
    sequelize,
    tableName: 'coursecodes',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "courseCodeID" },
        ]
      },
      {
        name: "courseCode",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "courseCode" },
        ]
      },
    ]
  });
};
