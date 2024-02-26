const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");

// create models
const Guest = db.guest
const User = db.users

// add guest to event
exports.inviteGuest = async (req, res) =>{
    const userId = req.body.userId;
    const eventId = req.body.eventId;
    Guest.create({
        userID: userId,
        eventID: eventId
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    })
}

// Remove guest from event
exports.removeGuest = async (req, res) =>{
    const userId = req.body.userId;
    const eventId = req.body.eventId;
    Guest.findOne({where:{
        userID: userId,
        eventID: eventId
    }}).then(guest =>{
        return guest.destroy();
    }).then(result =>{
        res.status(StatusCode.SuccessOK).send({message: `User ${result.userID} removed from event ${result.eventID}`});
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}

// Get all guest for a event
exports.getGuestByEvent = async (req, res) =>{
    const eventID = req.params.eventId;
    Guest.findAll(
        {
            where:{
                eventID: eventID
            },
            include:[
                {model: User, as: 'user', attributes: ['firstName','lastName','email','username']}
            ]        
    }).then(guests =>{
        res.status(StatusCode.SuccessOK).send(guests);
    }).catch(err =>{
        res.status(StatusCode.ServerErrorInternal).send({message: err.message});
    });
}
