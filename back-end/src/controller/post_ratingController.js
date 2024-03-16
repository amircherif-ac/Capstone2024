const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");
const io = require("../socket");

// create models
const Post_Rating = db.post_rating;

// create post rating
exports.createPostRating = (req, res) => {
    const userID = req.body.userID;
    const postID = req.body.postID;
    const rating = req.body.rating;
    Post_Rating.create({
        userID: userID,
        postID: postID,
        rating: rating,
    }).then(result => {
        io.getIO().emit('post_rating', { action: 'create', post: result});
        res.status(StatusCode.SuccessCreated).send(result);
    }).catch(err => {
        console.log('error creating post rating: ' + err)
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

exports.findPostRating = (req, res) => {
    const userID = req.params.userID;
    const postID = req.params.postID;
    const rating = req.body.rating;
    Post_Rating.findOne({
        where: { 
            [Op.and]: [
                { postID: postID },
                { userID: userID }
            ]
        },
    }).then(result => {
        res.status(StatusCode.SuccessCreated).send(result);
    }).catch(err => {
        console.log('error creating post rating: ' + err)
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}