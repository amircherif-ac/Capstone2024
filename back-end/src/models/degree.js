const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('degree', {
    degreeID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    degreeName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "degreeName"
    }
  }, {
    sequelize,
    tableName: 'degree',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "degreeID" },
        ]
      },
      {
        name: "degreeName",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "degreeName" },
        ]
      },
    ]
  });
};
