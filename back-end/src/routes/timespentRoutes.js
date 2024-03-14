const timespentController = require('../controller/timespentController');

const express = require('express');
const router = express.Router();

const { validateToken } = require("../middleware/AuthMiddleware")

// create time spent log
router.post('/create', validateToken, timespentController.createTimeSpent);

// get specific time spent by userID
router.get('/user/:userID', validateToken, timespentController.getUserTimeSpent);

module.exports = router;

