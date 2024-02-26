const threadController = require('../controller/threadController')
const express = require('express')
const router = express.Router()
const { validateToken } = require("../middleware/AuthMiddleware")

router.post('/create',validateToken,  threadController.createThread)

router.put('/edit', validateToken, threadController.editThread)

router.delete('/delete', validateToken, threadController.deleteThread)

router.get('/:replyID', validateToken, threadController.getThreadToReply)

module.exports = router