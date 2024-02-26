const DM_Controller = require('../controller/DM_Controller')
const express = require('express')
const router = express.Router()
const { validateToken } = require('../middleware/AuthMiddleware')

router.post('/create', validateToken, DM_Controller.createDM)

router.delete('/delete', validateToken, DM_Controller.deleteMessage)

router.put('/edit', validateToken, DM_Controller.editMessage)

router.get('/conversation', validateToken, DM_Controller.getConversation)

router.get('/:userId', validateToken, DM_Controller.getRecipient)

module.exports = router