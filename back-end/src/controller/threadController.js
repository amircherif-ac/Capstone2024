const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const Thread = db.thread
const User = db.users

// create a thread to a reply
exports.createThread = async (req, res) => {
    const userId = req.body.userId;
    const replyId = req.body.replyId;
    const threadText = req.body.threadText;
    const threadImagePath = req.body.threadImagePath;
    Thread.create({
        reply_ID: replyId,
        userID: userId,
        thread_text: threadText,
        thread_image_path: threadImagePath
    }).then(result => {
        res.status(StatusCode.SuccessCreated).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// Get all threads to a reply
exports.getThreadToReply = async (req, res) => {
    const replyId = req.params.replyID;
    Thread.findAll({
        where: { reply_ID: replyId },
        include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'username'] }
        ]
    }).then(threads => {
        res.status(StatusCode.SuccessOK).send(threads);
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    });
}

// Edit a thread
exports.editThread = async (req, res) => {
    thread
    const threadId = req.body.threadId;
    const threadText = req.body.threadText;
    const threadImagePath = req.body.threadImagePath;
    Thread.findByPk(threadId)
        .then(thread => {
            thread.thread_text = threadText;
            thread.thread_image_path = threadImagePath;
            return thread.save();
        }).then(result => {
            res.status(StatusCode.SuccessOK).send(result);
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}


// Delete a thread
exports.deleteThread = async (req, res) => {
    const threadId = req.body.threadId;
    Thread.findByPk(threadId)
        .then(thread => {
            return thread.destroy();
        }).then(result => {
            res.status(StatusCode.SuccessOK).send({ message: `thread '${result.thread_ID}' removed` });
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}


