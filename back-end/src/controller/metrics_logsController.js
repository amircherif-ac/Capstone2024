const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const MetricsLogs = db.metrics_logs

// create metrics log
exports.createMetricsLog = async (req, res) => {
    const userId = req.body.userId;
    const metricsId = req.body.metricsId;
    const date = req.body.date;
    const val = req.body.val;
    MetricsLogs.create({
        userID: userId,
        metrixID: metricsId,
        logdate: date,
        val: val
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// get all metrics log by userID
exports.getUserMetricsLog = async (req, res) => {
    const userId = req.params.userID;
    MetricsLogs.findAll({
        where: { userID: userId }
    }).then(threads => {
        res.status(StatusCode.SuccessOK).send(threads);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get "Total Time Spent" by userID per month for each month of the last 12 months
exports.getTotalTimeSpentPerMonth = async (req, res) => {
    const userId = req.params.userID;
    const currentDate = new Date();
    const last12Months = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
    MetricsLogs.findAll({
        where: {
            userID: userId,
            metrixID: 1,
            logdate: {
                [Op.gte]: last12Months
            }
        },
        attributes: [
            [db.sequelize.fn('month', db.sequelize.col('logdate')), 'month'],
            [db.sequelize.fn('sum', db.sequelize.col('val')), 'totalTimeSpent']
        ],
        group: [db.sequelize.fn('month', db.sequelize.col('logdate'))]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get "Total Session attended" by userID per month for each month of the last 12 months
exports.getTotalSessionAttendedPerMonth = async (req, res) => {
    const userId = req.params.userID;
    const currentDate = new Date();
    const last12Months = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
    MetricsLogs.findAll({
        where: {
            userID: userId,
            metrixID: 2,
            logdate: {
                [Op.gte]: last12Months
            }
        },
        attributes: [
            [db.sequelize.fn('month', db.sequelize.col('logdate')), 'month'],
            [db.sequelize.fn('sum', db.sequelize.col('val')), 'totalSessionAttended']
        ],
        group: [db.sequelize.fn('month', db.sequelize.col('logdate'))]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get "Avg Assessment grade" by userID per month for each month of the last 12 months
exports.getAvgAssessmentGradePerMonth = async (req, res) => {
    const userId = req.params.userID;
    const currentDate = new Date();
    const last12Months = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
    MetricsLogs.findAll({
        where: {
            userID: userId,
            metrixID: 3,
            logdate: {
                [Op.gte]: last12Months
            }
        },
        attributes: [
            [db.sequelize.fn('month', db.sequelize.col('logdate')), 'month'],
            [db.sequelize.fn('avg', db.sequelize.col('val')), 'avgAssessmentGrade']
        ],
        group: [db.sequelize.fn('month', db.sequelize.col('logdate'))]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get "Engagement Level" by userID per month for each month of the last 12 months
exports.getEngagementLevelPerMonth = async (req, res) => {
    const userId = req.params.userID;
    const currentDate = new Date();
    const last12Months = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
    MetricsLogs.findAll({
        where: {
            userID: userId,
            metrixID: 4,
            logdate: {
                [Op.gte]: last12Months
            }
        },
        attributes: [
            [db.sequelize.fn('month', db.sequelize.col('logdate')), 'month'],
            [db.sequelize.fn('avg', db.sequelize.col('val')), 'engagementLevel']
        ],
        group: [db.sequelize.fn('month', db.sequelize.col('logdate'))]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get "Total Time Spent" by userID per day for the last 7 days
exports.getTotalTimeSpentPerDay = async (req, res) => {
    const userId = req.params.userID;
    const currentDate = new Date();
    const last7Days = new Date(currentDate.setDate(currentDate.getDate() - 7));
    MetricsLogs.findAll({
        where: {
            userID: userId,
            metrixID: 1,
            logdate: {
                [Op.gte]: last7Days
            }
        },
        attributes: [
            [db.sequelize.fn('date', db.sequelize.col('logdate')), 'date'],
            [db.sequelize.fn('sum', db.sequelize.col('val')), 'totalTimeSpent']
        ],
        group: [db.sequelize.fn('date', db.sequelize.col('logdate'))]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get "Total Session attended" by userID per day for the last 7 days
exports.getTotalSessionAttendedPerDay = async (req, res) => {
    const userId = req.params.userID;
    const currentDate = new Date();
    const last7Days = new Date(currentDate.setDate(currentDate.getDate() - 7));
    MetricsLogs.findAll({
        where: {
            userID: userId,
            metrixID: 2,
            logdate: {
                [Op.gte]: last7Days
            }
        },
        attributes: [
            [db.sequelize.fn('date', db.sequelize.col('logdate')), 'date'],
            [db.sequelize.fn('sum', db.sequelize.col('val')), 'totalSessionAttended']
        ],
        group: [db.sequelize.fn('date', db.sequelize.col('logdate'))]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get "Avg Assessment grade" by userID per day for the last 7 days
exports.getAvgAssessmentGradePerDay = async (req, res) => {
    const userId = req.params.userID;
    const currentDate = new Date();
    const last7Days = new Date(currentDate.setDate(currentDate.getDate() - 7));
    MetricsLogs.findAll({
        where: {
            userID: userId,
            metrixID: 3,
            logdate: {
                [Op.gte]: last7Days
            }
        },
        attributes: [
            [db.sequelize.fn('date', db.sequelize.col('logdate')), 'date'],
            [db.sequelize.fn('avg', db.sequelize.col('val')), 'avgAssessmentGrade']
        ],
        group: [db.sequelize.fn('date', db.sequelize.col('logdate'))]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// get "Engagement Level" by userID per day for the last 7 days
exports.getEngagementLevelPerDay = async (req, res) => {
    const userId = req.params.userID;
    const currentDate = new Date();
    const last7Days = new Date(currentDate.setDate(currentDate.getDate() - 7));
    MetricsLogs.findAll({
        where: {
            userID: userId,
            metrixID: 4,
            logdate: {
                [Op.gte]: last7Days
            }
        },
        attributes: [
            [db.sequelize.fn('date', db.sequelize.col('logdate')), 'date'],
            [db.sequelize.fn('avg', db.sequelize.col('val')), 'engagementLevel']
        ],
        group: [db.sequelize.fn('date', db.sequelize.col('logdate'))]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}
