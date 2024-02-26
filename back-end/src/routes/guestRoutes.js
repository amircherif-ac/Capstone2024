const guestController = require('../controller/guestController')
const express = require('express')
const router = express.Router()
const {validateToken} = require('../middleware/AuthMiddleware')

router.post('/add', validateToken, guestController.inviteGuest );

router.delete('/remove', validateToken, guestController.removeGuest );

router.get('/event/:eventId', validateToken,  guestController.getGuestByEvent);

module.exports = router