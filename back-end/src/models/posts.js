const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('posts', {
    postID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'userID'
      }
    },
    is_post_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    courseID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courses',
        key: 'courseID'
      }
    },
    post_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    post_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    post_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    post_image_path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tagID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tags',
        key: 'tagID'
      }
    }
  }, {
    sequelize,
    tableName: 'posts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "postID" },
        ]
      },
      {
        name: "userID",
        using: "BTREE",
        fields: [
          { name: "userID" },
        ]
      },
      {
        name: "courseID",
        using: "BTREE",
        fields: [
          { name: "courseID" },
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
};
