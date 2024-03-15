const timespentController = require('../controller/metrics_logsController');

const express = require('express');
const router = express.Router();

// const { validateToken } = require("../middleware/AuthMiddleware")

// create time spent log
router.post('/create', timespentController.createMetricsLog);

// get specific time spent by userID
router.get('/user/:userID', timespentController.getUserMetricsLog);

// get "Total Time Spent" by userID per month for each month of the last 12 months
router.get('/totaltimespentmonth/:userID', timespentController.getTotalTimeSpentPerMonth);

// get "Total Session attended" by userID per month for each month of the last 12 months
router.get('/totalsessionattendedmonth/:userID', timespentController.getTotalSessionAttendedPerMonth);

// get "Avg Assessment grade" by userID per month for each month of the last 12 months
router.get('/avgassessmentgrademonth/:userID', timespentController.getAvgAssessmentGradePerMonth);

// get "Engagement Level" by userID per month for each month of the last 12 months
router.get('/engagementlevelmonth/:userID', timespentController.getEngagementLevelPerMonth);

// get "Total Time Spent" by userID per day for the last 7 days
router.get('/totaltimespentday/:userID', timespentController.getTotalTimeSpentPerDay);

// get "Total Session attended" by userID per day for the last 7 days
router.get('/totalsessionattendedday/:userID', timespentController.getTotalSessionAttendedPerDay);

// get "Avg Assessment grade" by userID per day for the last 7 days
router.get('/avgassessmentgradeday/:userID', timespentController.getAvgAssessmentGradePerDay);

// get "Engagement Level" by userID per day for the last 7 days
router.get('/engagementlevelday/:userID', timespentController.getEngagementLevelPerDay);

module.exports = router;