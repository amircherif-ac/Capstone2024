const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");
const Sequelize = require('sequelize');
const { arrayBuffer } = require('stream/consumers');

// create models
const Enrolled = db.enrolled
const User = db.users
const Courses = db.courses
const Subject = db.subject
const CourseCode = db.course_codes
const Tutor = db.tutor;
const Teacher = db.teacher;
const Role = db.role;

Enrolled.belongsTo(Tutor, {
    foreignKey: 'userID'
});

Tutor.hasMany(Enrolled, {
    foreignKey: 'userID'
});

Enrolled.belongsTo(Teacher, {
    foreignKey: 'userID'
});

Teacher.hasMany(Enrolled, {
    foreignKey: 'userID'
});

// enroll student to a course
exports.enroll = async (req, res) => {
    const userId = req.body.userId;
    const courseId = req.body.courseId;
    Enrolled.findOne({
        where: {
            userID: userId,
            courseID: courseId,
            isCurrentlyEnrolled: true,
        }
    }).then(enroll => {
        if (enroll) {
            res.status(StatusCode.SuccessOK).send({ message: `user already enrolled` });
        } else {
            return Enrolled.create({
                userID: userId,
                courseID: courseId,
                isCurrentlyEnrolled: true
            })
        }
    }).then(result => {
        // response when student successfully enrolls 
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}


// Remove enrollment
exports.withdraw = async (req, res) => {
    const userId = req.body.selectedUserId;
    const courseId = req.body.courseId;

    console.log(`userid: ${userId}, courseID: ${courseId}`)
    Enrolled.findOne({
        where: {
            userID: userId,
            courseID: courseId
        }
    }).then(enrollee => {
        return enrollee.destroy();
    }).then(result => {
        res.status(StatusCode.SuccessOK).send({ message: `User successfully withdrew from the course` });
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}



// get current enrolled student for a course
exports.getCurrentEnrollments = async (req, res) => {
    const courseId = req.params.courseId;
    Enrolled.findAll({
        where: {
            courseID: courseId,
            isCurrentlyEnrolled: true,
        },
        attributes: ['userID', 'courseID'],
        include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'username'] }
        ]
    }).then(enrollees => {
        res.status(StatusCode.SuccessOK).send({ enrollees });
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get current enrolled student for a course
exports.getCurrentEnrollmentsV2 = async (req, res) => {
    const courseId = req.params.courseId;
    Enrolled.findAll({
        where: {
            courseID: courseId,
            isCurrentlyEnrolled: true,
        },
        attributes: [
            'courseID',
            [Sequelize.literal(`CASE 
                WHEN \`user\`.\`roleID\` = 3 THEN 'Admin'
                WHEN \`teacher\`.\`userID\` IS NOT NULL THEN 'Teacher'
                WHEN \`tutor\`.\`userID\` IS NOT NULL THEN 'Tutor'
                ELSE 'Student'
            END`), 'Role']
        ],
        include: [
            {
                model: Tutor,
                required: false,
                attributes: [],
                where: {
                    courseID: courseId,
                    userID: Sequelize.col('enrolled.userID')
                }
            },
            {
                model: Teacher,
                required: false,
                attributes: [],
                where: {
                    courseID: courseId,
                    userID: Sequelize.col('enrolled.userID')
                }

            },
            {
                model: User,
                as: 'user',
                attributes: ['userID', 'firstName', 'lastName', 'email', 'username']
            }
        ]
    }).then(enrollees => {
        res.status(StatusCode.SuccessOK).send({ enrollees });
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// Get the enrolled courses for a user
exports.getUsersEnrolledCourses = async (req, res, next) => {
    const userId = req.params.userId;
    Enrolled.findAll({
        where: {
            userID: userId,
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
    }).then(courses => {
        res.status(StatusCode.SuccessOK).send({ courses });
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}


// update the isCurrentlyEnrolled
exports.updateEnrollmentStatus = async (req, res, next) => {
    const userId = req.body.userId;
    const courseId = req.body.courseId;
    const isCurrentlyEnrolled = req.body.isCurrentlyEnrolled;
    Enrolled.findOne({
        where: {
            userID: userId,
            courseID: courseId
        }
    }).then(enrollee => {
        enrollee.isCurrentlyEnrolled = isCurrentlyEnrolled
        return enrollee.save();
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

//================================================================================================
// Added for AI integration purposes

// given user id, get the courses id if the user is currently enrolled
exports.getUsersEnrolledCoursesAI = async (req, res, next) => {
    const userId = req.params.userId;
    Enrolled.findAll({
        where: {
            userID: userId,
            isCurrentlyEnrolled: true
        },
        attributes: ['courseID']
    }).then(courses => {
        // extract the course id from the result as array of integers
        const course_ids = courses.map(course => course.courseID);
        
        res.status(StatusCode.SuccessOK).send(course_ids);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}
