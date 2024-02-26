const replyController = require('../controller/repliesController')
const express = require('express')
const router = express.Router()
const { validateToken } = require("../middleware/AuthMiddleware")

router.post('/create', validateToken, replyController.createReply)

router.put('/edit', validateToken, replyController.editReply)

router.put('/verify', validateToken, replyController.updateVerification)

router.delete('/delete', validateToken, replyController.deleteReply)

router.get('/verified/postID', validateToken, replyController.getVerifiedReplies)

router.get('/:postID', validateToken, replyController.getRepliesToPost)

module.exports = router