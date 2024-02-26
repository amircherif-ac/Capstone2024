const userController = require('../controller/userController')
const express = require('express')
const router = express.Router()
const { validateToken } = require("../middleware/AuthMiddleware")

router.post('/register', userController.register)

router.post('/login', userController.login)

// Get all
router.get('/', validateToken, userController.getAllUsers)

router.get('/:userId', validateToken, userController.getSpecificUser)

router.put('/edit', validateToken, userController.updateUser)

router.put('/newPassword', validateToken, userController.updatePassword)

router.delete('/remove', validateToken, userController.deleteUser)

router.get('/username/:selectedUsername', validateToken, userController.getUserWithUsername)

module.exports = router