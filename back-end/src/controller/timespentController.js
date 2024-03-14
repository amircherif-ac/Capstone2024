const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const TimeSpent = db.timespent;
const User = db.users;

// create time spent log
exports.createTimeSpent = async (req, res) => {
    const userId = req.body.userId;
    const timeSpentLog = req.body.timeSpentLog;
    const date = req.body.date;
    TimeSpent.create({
        userID: userId,
        timeSpentLog: timeSpentLog,
        date: date
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// get specific time spent by userID
exports.getUserTimeSpent = async (req, res) => {
    const userId = req.params.userID;
    TimeSpent.findAll({
        where: { userID: userId }
    }).then(threads => {
        res.status(StatusCode.SuccessOK).send(threads);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}


