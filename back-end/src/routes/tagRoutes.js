const tagController = require('../controller/tagController')
const express = require('express')
const router = express.Router()
const { validateToken } = require('../middleware/AuthMiddleware')

router.post('/create', validateToken, tagController.createTag)

router.get('/tags', validateToken, tagController.getAllTags)

module.exports = router