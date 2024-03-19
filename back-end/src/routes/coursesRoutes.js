const coursesController = require('../controller/coursesController')
const express = require('express')
const router = express.Router()
const { validateToken } = require('../middleware/AuthMiddleware')

router.get('/', validateToken, coursesController.getAllCourses)
//========================================================================================================================
// Added for AI integration purposes

// get all courses for AI, courseId, courseTitle, description
router.get('/ai', coursesController.getAllCoursesAI)
// ========================================================================================================================

router.get('/:courseId', validateToken, coursesController.getCourseById)

router.get('/id/:courseName', validateToken, coursesController.getCourseIdByName)

module.exports = router