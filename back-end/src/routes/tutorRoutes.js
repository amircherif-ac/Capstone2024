const tutorController = require('../controller/tutorController')
const express = require('express')
const router = express.Router()
const { validateToken } = require("../middleware/AuthMiddleware")

router.post('/register', validateToken, tutorController.registerTutor);

router.delete('/remove', validateToken, tutorController.removeTutor);

router.get('/course/:courseId', validateToken, tutorController.getCourseTutors);

router.get('/course/user/:userId', validateToken, tutorController.getAllCourseByTutor)

router.get('/', validateToken, tutorController.getAllTutors)

module.exports = router