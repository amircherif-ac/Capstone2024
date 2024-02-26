const coursesController = require('../controller/coursesController')
const express = require('express')
const router = express.Router()
const { validateToken } = require('../middleware/AuthMiddleware')

router.get('/', validateToken, coursesController.getAllCourses)

router.get('/:courseId', validateToken, coursesController.getCourseById)

router.get('/id/:courseName', validateToken, coursesController.getCourseIdByName)

module.exports = router