const Sequelize = require('sequelize')
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('tags', {
        tagID: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        tagName: {
            type: DataTypes.STRING(45),
            allowNull: false
        }
    }, {
        sequelize,
        tableName: 'tags',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "tagID" },
                ]
            },
         ]
    });
};