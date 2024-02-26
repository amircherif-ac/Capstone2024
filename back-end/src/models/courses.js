const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('courses', {
    courseID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    school_key: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    facultyID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'faculty',
        key: 'facultyID'
      }
    },
    departmentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'department',
        key: 'departmentID'
      }
    },
    courseLevelID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'courselevel',
        key: 'courseLevelID'
      }
    },
    degreeID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'degree',
        key: 'degreeID'
      }
    },
    subjectID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'subject',
        key: 'subjectID'
      }
    },
    courseTitle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    programID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'program',
        key: 'programID'
      }
    }
  }, {
    sequelize,
    tableName: 'courses',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "courseID" },
        ]
      },
      {
        name: "facultyID",
        using: "BTREE",
        fields: [
          { name: "facultyID" },
        ]
      },
      {
        name: "departmentID",
        using: "BTREE",
        fields: [
          { name: "departmentID" },
        ]
      },
      {
        name: "courseLevelID",
        using: "BTREE",
        fields: [
          { name: "courseLevelID" },
        ]
      },
      {
        name: "degreeID",
        using: "BTREE",
        fields: [
          { name: "degreeID" },
        ]
      },
      {
        name: "subjectID",
        using: "BTREE",
        fields: [
          { name: "subjectID" },
        ]
      },
      {
        name: "programID",
        using: "BTREE",
        fields: [
          { name: "programID" },
        ]
      },
      {
        name: "school_key",
        using: "BTREE",
        fields: [
          { name: "school_key" },
        ]
      },
    ]
  });
};
