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

exports.updatePostRating = (req, res) => {
    const userID = req.params.userID;
    const postID = req.params.postID;
    const rating = req.params.rating;

    Post_Rating.update({
        rating: rating,
    }, {
        where: {
            [Op.and]: [
                { postID: postID },
                { userID: userID }
            ]
        },
    })
    .then(result => {
        res.status(StatusCode.SuccessOK).send({ message: `Post rating updated.`})
    }).catch(err => {
        console.log('error finding post rating: ' + err)
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

exports.getPostVotes = (req, res) => {
    const postID = req.params.postID;

    Post_Rating.findAll({
        attributes: [
            [db.sequelize.fn('SUM', db.sequelize.col('rating')), 'rating']
        ],
        where: {
            postID: postID
        }
    })
    .then(result => {
        res.status(StatusCode.SuccessOK).send(result)
    })
    .catch(err => {
        console.log('error getting post rating: ' + err);
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}