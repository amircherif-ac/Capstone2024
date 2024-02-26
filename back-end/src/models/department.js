const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('department', {
    departmentID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    departmentName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "departmentName"
    }
  }, {
    sequelize,
    tableName: 'department',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "departmentID" },
        ]
      },
      {
        name: "departmentName",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "departmentName" },
        ]
      },
    ]
  });
};
