const db = require('../models')
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");
const io = require('../socket')

// create models
const Tags = db.tags;

exports.createTag = async (req, res) => {

}

exports.getAllTags = async (req, res) => {

    Tags.findAll({

    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message})
    })
}