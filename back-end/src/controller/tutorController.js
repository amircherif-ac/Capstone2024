const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const Tutor = db.tutor
const User = db.users
const Courses = db.courses
const Subject = db.subject
const CourseCode = db.course_codes

// Register Tutor for a course
exports.registerTutor = async (req, res) => {
    const userId = req.body.selectedUserId;
    const courseId = req.body.courseId;
    Tutor.create({
        userID: userId,
        courseID: courseId
    }).then(result => {
        res.status(StatusCode.SuccessCreated).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// Remove tutor from a course
exports.removeTutor = async (req, res) => {
    const userId = req.body.selectedUserId;
    const courseId = req.body.courseId;
    Tutor.findOne({
        where: {
            userID: userId,
            courseID: courseId
        }
    }).then(tutor => {
        return tutor.destroy();
    }).then(result => {
        res.status(StatusCode.SuccessOK).send({ message: `'User ${result.userID}' removed as a tutor` });
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// Get all tutors for a course
exports.getCourseTutors = async (req, res) => {
    const courseId = req.params.courseId;
    Tutor.findAll(
        {
            where: {
                courseID: courseId
            },
            include: [
                { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'username'] },
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
        }).then(tutor => {
            res.status(StatusCode.SuccessOK).send(tutor);
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}

// Get all courses the tutor is teaching
exports.getAllCourseByTutor = async (req, res) => {
    const userId = req.params.userId;
    Tutor.findAll(
        {
            where: {
                userID: userId
            },
            include: [
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
        }).then(tutor => {
            res.status(StatusCode.SuccessOK).send(tutor);
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}


// Get all tutors
exports.getAllTutors = async (req, res) => {
    Tutor.findAll(
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
        }).then(tutors => {
            res.status(StatusCode.SuccessOK).send(tutors);
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}