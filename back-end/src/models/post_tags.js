const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('post_tags', {
        postID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'posts',
                key: 'postID'
            }
        },
        tagID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'tags',
                key: 'tagID'
            }
        }
    }, {
        sequelize,
        tableName: 'post_tags',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "postID",
                      name: "tagID"    
                },
                ]
            },
            {
                name: "postID",
                using: "BTREE",
                fields: [
                    { name: "postID" },
                ]
            },
            {
                name: "tagID",
                using: "BTREE",
                fields: [
                    { name: "tagID" },
                ]
            },
        ]
    });
}