const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const Courses = db.courses;
const Subject = db.subject;
const CourseCode = db.course_codes;
const Program = db.program;
const Degree = db.degree;
const CourseLevel = db.course_level;

// Retrieve all available courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Courses.findAll({
            attributes: ['courseId', 'courseTitle', 'description'],
            include: [
                {
                    model: Subject,
                    as: 'subject',
                    attributes: ['courseNumber'],
                    where: { courseNumber: { [Op.ne]: '' } },
                    include: [
                        {
                            model: CourseCode,
                            as: 'courseCode',
                            attributes: ['courseCode']
                        }
                    ]
                },
                {
                    model: CourseLevel,
                    as: "courseLevel",
                    attributes: ['courseLevel']
                },
                {
                    model: Program,
                    as: "program",
                    attributes: ['programName']
                },
                {
                    model: Degree,
                    as: "degree",
                    attributes: ['degreeName']
                }
            ]
        });
        res.status(StatusCode.SuccessOK).send(courses)
    } catch (err) {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    }
}

// Get specific course
const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.courseId
        const courses = await Courses.findOne(
            {
                where: {
                    courseId: courseId
                },
                attributes: ['courseId', 'courseTitle', 'description'],
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['courseNumber'],
                        where: { courseNumber: { [Op.ne]: '' } },
                        include: [
                            {
                                model: CourseCode,
                                as: 'courseCode',
                                attributes: ['courseCode']
                            }
                        ]
                    },
                    {
                        model: CourseLevel,
                        as: "courseLevel",
                        attributes: ['courseLevel']
                    },
                    {
                        model: Program,
                        as: "program",
                        attributes: ['programName']
                    },
                    {
                        model: Degree,
                        as: "degree",
                        attributes: ['degreeName']
                    }
                ]
            });
        res.status(StatusCode.SuccessOK).send(courses)
    } catch (err) {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    }
}
// get specific userId with the use of their username
const getCourseIdByName = async (req, res) => {

    try {
        let courseName = req.params.courseName    //COEN212
        courseName = courseName.match(/^([a-zA-Z]+)(\d+)$/)
        const courseNumber = parseInt(courseName[2]);
        const courseCode = courseName[1].toUpperCase();

        const course = await Courses.findOne({
            attributes: ['courseID'],
            include: [
                {
                    model: Subject,
                    as: 'subject',
                    where: { courseNumber: courseNumber },
                    include: [
                        {
                            model: CourseCode,
                            as: 'courseCode',
                            where: { courseCode: courseCode },
                        }
                    ]
                }
            ]
        });
        const courseId = course.courseID;
        res.status(StatusCode.SuccessOK).send({ courseId: courseId })
        //console.log(courseID); // Output: the courseID that matches the conditions

    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    getAllCourses,
    getCourseById,
    getCourseIdByName
}