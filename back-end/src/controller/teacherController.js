const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const Teacher = db.teacher
const User = db.users
const Courses = db.courses
const Subject = db.subject
const CourseCode = db.course_codes

// Register teacher for a course
exports.registerTeacher = async (req, res) => {
    const userId = req.body.selectedUserId;
    const courseId = req.body.courseId;
    Teacher.create({
        userID: userId,
        courseID: courseId
    }).then(result => {
        res.status(StatusCode.SuccessCreated).send({ message: "Success" })
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// Remove teacher from a course
exports.removeTeacher = async (req, res) => {
    const userId = req.body.selectedUserId;
    const courseId = req.body.courseId;
    Teacher.findOne({
        where: {
            userID: userId,
            courseID: courseId
        }
    }).then(teacher => {
        return teacher.destroy();
    }).then(result => {
        res.status(StatusCode.SuccessOK).send({ message: `'User ${result.userID}' removed as a teacher` });
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// Get all teachers 
exports.getAllTeachers = async (req, res) => {
    Teacher.findAll(
        {
            include: [
                { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
                {
                    model: Courses, as: 'course', attributes: ['courseTitle'], include: [
                        {
                            model: Subject, as: 'subject', attributes: ['courseNumber'], include: [
                                { model: CourseCode, as: 'courseCode', attributes: ['courseCode'] }
                            ]
                        }
                    ]
                }
            ]
        }).then(teacher => {
            res.status(StatusCode.SuccessOK).send(teacher);
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}

// Get all teachers for a course
exports.getCourseTeachers = async (req, res) => {
    const courseId = req.params.courseId;
    Teacher.findAll(
        {
            where: {
                courseID: courseId
            },
            include: [
                { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'username'] }
            ]
        }).then(teacher => {
            res.status(StatusCode.SuccessOK).send(teacher);
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}