const postController = require('../controller/postController')
const tagController = require('../controller/tagController')
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

// get post/api/tags/{tagID}
router.get('/tags/:tagID', validateToken, postController.getPostByTagID)

// get /api/post/tags
router.get('/tags', validateToken, tagController.getAllTags)

// get specific
router.get('/:postId', validateToken, postController.getPostById)

module.exports = router
