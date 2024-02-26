const calendarController = require('../controller/calendarController')
const express = require('express')
const router = express.Router()
const { validateToken } = require("../middleware/AuthMiddleware")

router.get('/user/:userID', validateToken, calendarController.getUserEvent)

router.get('/course/:courseId', validateToken, calendarController.getEventByCourse)

router.get('/event/:eventId', validateToken, calendarController.getEventById)

router.post('/create', validateToken, calendarController.createEvent)

router.put('/edit', validateToken, calendarController.editEvent)

router.delete('/delete', validateToken, calendarController.deleteEvent)

module.exports = router