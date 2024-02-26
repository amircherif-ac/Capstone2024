const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('role', {
    roleID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    roleName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: "roleName"
    }
  }, {
    sequelize,
    tableName: 'role',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "roleID" },
        ]
      },
      {
        name: "roleName",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "roleName" },
        ]
      },
    ]
  });
};
