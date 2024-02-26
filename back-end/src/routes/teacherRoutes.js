const teacherController = require('../controller/teacherController')
const express = require('express')
const router = express.Router()
const { validateToken } = require("../middleware/AuthMiddleware")

// /api/teacher/
router.post('/register', validateToken, teacherController.registerTeacher);

router.delete('/remove', validateToken, teacherController.removeTeacher);

router.get('/course/:courseId', validateToken, teacherController.getCourseTeachers);

router.get('/', teacherController.getAllTeachers);

module.exports = router