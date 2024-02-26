const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");
const io = require('../socket')

// create models
const Reply = db.replies
const User = db.users

// create a reply to a post
exports.createReply = async (req, res) =>{
    const userId = req.body.userId;
    const postId = req.body.postId;
    const replyText = req.body.replyText;
    const replyImagePath = req.body.replyImagePath;
    Reply.create({
        postID: postId,
        userID: userId,
        reply_text: replyText,
        reply_image_path: replyImagePath
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    })
}

// Get all replies to a post
exports.getRepliesToPost = async (req, res) =>{
    const postId = req.params.postID;
    Reply.findAll({
        where:{postID: postId},
        include:[
            {model: User, as: 'user', attributes: ['firstName','lastName','email','username']}
        ]
    }).then(replies =>{
        res.status(StatusCode.SuccessOK).send(replies);
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}

// Get all verified replies to a post
exports.getVerifiedReplies = async (req, res) =>{
    const postId = req.params.postID;
    Reply.findAll({
        where:{
            postID: postId, 
            is_reply_verified: true
        },
        include:[
            {model: User, as: 'user', attributes: ['firstName','lastName','email','username']}
        ]
    }).then(replies =>{
        res.status(StatusCode.SuccessOK).send(replies);
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}

// Edit a reply
exports.editReply = async (req, res) =>{
    const replyId = req.body.replyId;
    const replyText = req.body.replyText;
    const replyImagePath = req.body.replyImagePath;
    Reply.findByPk(replyId)
    .then(reply =>{
        reply.reply_text = replyText;
        reply.reply_image_path = replyImagePath;
        return reply.save();
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send(result);
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}


// Delete a reply
exports.deleteReply = async (req, res) =>{
    const replyId = req.body.replyId;
    Reply.findByPk(replyId)
    .then(reply =>{
        return reply.destroy();
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send({message: `Reply '${result.reply_ID}' removed`});
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}

// Update reply to verified
exports.updateVerification = async(req, res, next) =>{
    const replyId = req.body.replyId;
    const isVerified = req.body.isVerified
    Reply.findByPk(replyId)
    .then(reply =>{
        reply.is_reply_verified = isVerified
        return reply.save();
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send({message: `Reply '${result.replyID}' verified.`});
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}


