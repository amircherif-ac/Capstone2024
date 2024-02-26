const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const Calendar = db.calendar
const User = db.users
const Courses = db.courses
const Subject = db.subject
const CourseCode = db.course_codes

// create event
exports.createEvent = async (req, res) => {
    const userId = req.body.userId;
    const courseId = req.body.courseId;
    const title = req.body.title;
    const eventDescription = req.body.eventDescription;
    const scheduledAt = req.body.scheduledAt;
    const scheduleEndTime = req.body.scheduleEndTime;
    const triggeredAt = req.body.triggeredAt;
    const location = req.body.location;
    Calendar.create({
        userID: userId,
        title: title,
        eventDescription: eventDescription,
        scheduledAt: scheduledAt,
        scheduleEndTime: scheduleEndTime,
        triggeredAt: triggeredAt,
        courseID: courseId,
        location: location
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// Get all user's event
exports.getUserEvent = async (req, res) => {
    const userId = req.params.userID;
    Calendar.findAll({
        where: { userID: userId },
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
    }).then(threads => {
        res.status(StatusCode.SuccessOK).send(threads);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get specific event by course
exports.getEventByCourse = async (req, res) => {
    const courseId = req.params.courseId;
    Calendar.findAll({
        where: { courseID: courseId },
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
    }).then(events => {
        res.status(StatusCode.SuccessOK).send(events);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// Get specific event by id
exports.getEventById = async (req, res, next) => {
    const eventId = req.params.eventId;
    Calendar.findOne({
        where: { eventID: eventId },
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
    })
        .then(event => {
            res.status(StatusCode.SuccessOK).send(event)
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message })
        })
}

// Edit a event
exports.editEvent = async (req, res) => {
    const eventId = req.body.eventId;
    const courseId = req.body.courseId;
    const title = req.body.title;
    const eventDescription = req.body.eventDescription;
    const scheduledAt = req.body.scheduledAt;
    const scheduleEndTime = req.body.scheduledEndTime;
    const triggeredAt = req.body.triggeredAt;
    const location = req.body.location;
    Calendar.findByPk(eventId)
        .then(event => {
            event.title = title;
            event.eventDescription = eventDescription;
            event.scheduledAt = scheduledAt;
            event.scheduleEndTime = scheduleEndTime;
            event.triggeredAt = triggeredAt;
            event.courseID = courseId;
            event.location = location;
            return event.save();
        }).then(result => {
            res.status(StatusCode.SuccessOK).send(result);
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}

// Delete a event
exports.deleteEvent = async (req, res) => {
    const eventId = req.body.eventId;
    Calendar.findByPk(eventId)
        .then(event => {
            return event.destroy();
        }).then(result => {
            res.status(StatusCode.SuccessOK).send({ message: `Event '${result.eventID}' removed` });
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}


