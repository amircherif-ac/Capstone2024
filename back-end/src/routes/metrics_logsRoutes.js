const metrics_logsController = require('../controller/metrics_logsController');

const express = require('express');
const router = express.Router();

// const { validateToken } = require("../middleware/AuthMiddleware")

// create time spent log
router.post('/create', metrics_logsController.createMetricsLog);

// get All metrics logs by userID (used for testing and debugging)
router.get('/user/:userID', metrics_logsController.getUserMetricsLog);

// get "Total Time Spent" by userID per month for each month of the last 12 months
router.get('/totaltimespentmonth/:userID', metrics_logsController.getTotalTimeSpentPerMonth);

// get "Total Session attended" by userID per month for each month of the last 12 months
router.get('/totalsessionattendedmonth/:userID', metrics_logsController.getTotalSessionAttendedPerMonth);

// get "Avg Assessment grade" by userID per month for each month of the last 12 months
router.get('/avgassessmentgrademonth/:userID', metrics_logsController.getAvgAssessmentGradePerMonth);

// get "Engagement Level" by userID per month for each month of the last 12 months
router.get('/engagementlevelmonth/:userID', metrics_logsController.getEngagementLevelPerMonth);

// get "Total Time Spent" by userID per day for the last 7 days
router.get('/totaltimespentday/:userID', metrics_logsController.getTotalTimeSpentPerDay);

// get "Total Session attended" by userID per day for the last 7 days
router.get('/totalsessionattendedday/:userID', metrics_logsController.getTotalSessionAttendedPerDay);

// get "Avg Assessment grade" by userID per day for the last 7 days
router.get('/avgassessmentgradeday/:userID', metrics_logsController.getAvgAssessmentGradePerDay);

// get "Engagement Level" by userID per day for the last 7 days
router.get('/engagementlevelday/:userID', metrics_logsController.getEngagementLevelPerDay);

module.exports = router;