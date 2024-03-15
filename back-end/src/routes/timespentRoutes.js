const timespentController = require('../controller/timespentController');

const express = require('express');
const router = express.Router();

// const { validateToken } = require("../middleware/AuthMiddleware")

// create time spent log
router.post('/create', timespentController.createTimeSpent);

// get specific time spent by userID
router.get('/user/:userID', timespentController.getUserTimeSpent);

// Get all logs
router.get('/all', timespentController.getAllLogs);


module.exports = router;

