const postController = require('../controller/postController')
const express = require('express')
const router = express.Router()
const { validateToken } = require('../middleware/AuthMiddleware')

router.post('/create', validateToken, postController.createPost)

router.delete('/delete', validateToken, postController.deletePost)

router.patch('/edit', validateToken, postController.editPost)

router.patch('/verify', validateToken, postController.updateVerification)

// get post/api/course/{courseId}
router.get('/course/:courseId', validateToken, postController.getPostByCourse)

router.get('/course/verified/:courseId', validateToken, postController.getVerifiedPostByCourse)

// get specific
router.get('/:postId', validateToken, postController.getPostById)

module.exports = router
