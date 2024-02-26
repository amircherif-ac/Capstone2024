const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('courselevel', {
    courseLevelID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    courseLevel: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "courseLevel"
    }
  }, {
    sequelize,
    tableName: 'courselevel',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "courseLevelID" },
        ]
      },
      {
        name: "courseLevel",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "courseLevel" },
        ]
      },
    ]
  });
};
