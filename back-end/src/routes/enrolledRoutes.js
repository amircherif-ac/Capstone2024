const enrolledController = require('../controller/enrolledController')
const express = require('express')
const router = express.Router()
const { validateToken } = require('../middleware/AuthMiddleware')

router.post('/enroll', validateToken, enrolledController.enroll);

router.delete('/withdraw', validateToken, enrolledController.withdraw);

router.get('/courseStudents/:courseId', validateToken, enrolledController.getCurrentEnrollments)

router.get('/courseStudentsV2/:courseId', validateToken, enrolledController.getCurrentEnrollmentsV2)


router.get('/studentCourses/:userId', validateToken, enrolledController.getUsersEnrolledCourses)

router.put('/statusUpdate', validateToken, enrolledController.updateEnrollmentStatus)

module.exports = router
