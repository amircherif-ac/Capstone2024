const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('post_rating', {
        voteID: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        userID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userID'
            }
        },
        postID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'posts',
                key: 'postID'
            }
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        sequelize,
        tableName: 'post_rating',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: voteID }
                ]
            },
            {
                name: "userID",
                using: "BTREE",
                fields: [
                    { name: "userID" }
                ]
            },
            {
                name: "postID",
                using: "BTREE",
                fields: [
                    { name: "postID" }
                ]
            },
        ]
    });
}