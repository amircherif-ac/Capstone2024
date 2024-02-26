const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");
const io = require('../socket')

// create models
const DM = db.direct_message
const User = db.users
const socketDM = 'DM'

// Create direct message
exports.createDM = async (req, res) =>{
    const senderId = req.body.userId;
    const recipientId = req.body.recipientId;
    const message = req.body.message;
    const imagePath = req.body.imagePath;

    DM.create({
        senderID: senderId,
        recipientID: recipientId,
        message: message,
        post_image_path: imagePath
    }).then(result =>{
        io.getIO().emit(socketDM, {action: 'create', dm: result});
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    })
}


// Get all people that the user is talking to
exports.getRecipient = async (req, res) =>{
    const userId = req.params.userId
    DM.findAll({
        where:{
            senderId: userId,
        },
        attributes:['senderID'],
        include: [
            {
                model: User, 
                as: 'recipient', 
                attributes: ['userID','firstName','lastName','email','username']
            }
        ],
        group:['recipient.userID']
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    })
}

// get all message between the sender and the recipient 
// in descending order by the date created
exports.getConversation = async (req,res) =>{
    const senderId = req.body.senderId;
    const recipientId = req.body.recipientId;
    DM.findAll({
        where:{
            [Op.or]:[
                {[Op.and]:[{senderID:senderId},{recipientID:recipientId}]},
                {[Op.and]:[{senderID:recipientId},{recipientID:senderId}]}
            ]
        },
        order: [['message_time', 'DESC']]
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    })
}

// Delete a message
exports.deleteMessage = async(req,res)=>{
    const dmID = req.body.dmID
    DM.findByPk(dmID)
    .then(message =>{
        return message.destroy();
    }).then(result =>{
        io.getIO().emit(socketDM, {action: 'delete', dm: result});
        res.status(StatusCode.SuccessOK).send({message: `message removed`});
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}

// Edit a message
exports.editMessage = async(req, res, now) =>{
    const dmID = req.body.dmID;
    const msg = req.body.message;
    const imagePath = req.body.imagePath;
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();

    let editDate = `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    DM.findByPk(dmID)
    .then(message =>{
        message.message = msg;
        message.post_image_path = imagePath;
        message.edit_time = editDate
        return message.save();
    }).then(result =>{
        io.getIO().emit(socketDM, {action: 'edit', dm: result});
        res.status(StatusCode.SuccessOK).send({message: `Edit successful`});
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}
