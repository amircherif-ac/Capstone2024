const roleController = require('../controller/roleController')
const express = require('express')
const router = express.Router()
const { validateToken } = require("../middleware/AuthMiddleware")

router.get('/', validateToken, roleController.getRoles)

router.post('/create',validateToken,  roleController.createRole)

router.put('/update', validateToken, roleController.updateRole)

router.delete('/delete',validateToken, roleController.deleteRole)

module.exports = router