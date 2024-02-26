const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subject', {
    subjectID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    courseCodeID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'coursecodes',
        key: 'courseCodeID'
      }
    },
    courseNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'subject',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "subjectID" },
        ]
      },
      {
        name: "courseCodeID",
        using: "BTREE",
        fields: [
          { name: "courseCodeID" },
        ]
      },
    ]
  });
};
