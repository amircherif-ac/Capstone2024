const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('program', {
    programID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    programName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "programName"
    }
  }, {
    sequelize,
    tableName: 'program',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "programID" },
        ]
      },
      {
        name: "programName",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "programName" },
        ]
      },
    ]
  });
};
