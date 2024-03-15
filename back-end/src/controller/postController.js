const db = require('../models');
const { StatusCode } = require('status-code-enum');
const { Op } = require("sequelize");
const io = require('../socket')

// create models
const Post = db.post;
const Courses = db.courses;
const Subject = db.subject;
const CourseCode = db.course_codes;
const User = db.users;
const Tutor = db.tutor;
const Teacher = db.teacher;
const Tags = db.tags;

// Create direct message
exports.createPost = async (req, res) => {
    const userId = req.body.userId;
    const courseId = req.body.courseId;
    const postTitle = req.body.postTitle;
    const postText = req.body.postText;
    const postImagePath = req.body.postImagePath;
    const tagID = req.body.tagID;
    Post.create({
        userID: userId,
        courseID: courseId,
        post_title: postTitle,
        post_text: postText,
        post_image_path: postImagePath,
        tagID: tagID
    }).then(result => {
        io.getIO().emit('posts', { action: 'create', post: result });
        res.status(StatusCode.SuccessCreated).send(result);
    }).catch(err => {
        console.log('error creating post: ' + err)
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// Get post
// Check which role the user is in and return what they need to see
// If role is Student(2) return only verified and his own post
// Other roles will view everything
exports.getPostByCourse = async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.body.userId;
    const roleId = req.body.roleId;

    let isTeacher = false;
    let isTutor = false;
    //Search Teacher for a course
    await Teacher.findAll({
        where: {
            courseID: courseId,
        }
    }).then(teacher => {
        for (let i = 0; i < teacher.length; i++) {
            let teacherUserID = teacher[i].dataValues.userID
            if (teacherUserID === userId) {
                isTeacher = true;
                break;
            }
        }
    }).catch(err => {
        console.log(err)
    })

    //Search Tutor for a course
    await Tutor.findAll({
        where: {
            courseID: courseId,
        }
    }).then(tutor => {
        for (let i = 0; i < tutor.length; i++) {
            let tutorUserID = tutor[i].dataValues.userID
            if (tutorUserID === userId) {
                isTutor = true;
                break;
            }
        }
    }).catch(err => {
        console.log(err)
    })


    // checking if post id verified for a student
    if (roleId === 3 || isTeacher || isTutor) {
        Post.findAll({
            where: { courseID: courseId },
            include: [
                { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'username'] },
                {
                    model: Courses, as: 'course', attributes: ['courseTitle'], include: [
                        {
                            model: Subject, as: 'subject', attributes: ['courseNumber'], include: [
                                { model: CourseCode, as: 'courseCode', attributes: ['courseCode'] }
                            ]
                        }
                    ]
                }
            ],
            order: [
                ['post_date', 'DESC']
            ]
        }).then(result => {
            res.status(StatusCode.SuccessOK).send(result)
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        })
    } else {
        Post.findAll({
            where: {
                [Op.or]: [
                    { [Op.and]: [{ courseId: courseId }, { is_post_verified: true }] },
                    { [Op.and]: [{ userID: userId }, { courseId: courseId }] }
                ]
            },
            include: [
                { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'username'] },
                {
                    model: Courses, as: 'course', attributes: ['courseTitle'], include: [
                        {
                            model: Subject, as: 'subject', attributes: ['courseNumber'], include: [
                                { model: CourseCode, as: 'courseCode', attributes: ['courseCode'] }
                            ]
                        }
                    ]
                }
            ],
            order: [
                ['post_date', 'DESC']
            ]
        }).then(result => {
            res.status(StatusCode.SuccessOK).send(result)
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        })
    }
}

// get posts by tag id
exports.getPostByTagID = async (req, res) => {
    const tagID = req.params.tagID;
    Post.findAll({
        where: { tagID: tagID },
        // include causing issues 
        include: [
            { model: Tags, as: 'tags', attributes: ['tagName'] }
        ],
        order: [
            ['post_date', 'DESC']
        ]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// get specific post by id
exports.getPostById = async (req, res) => {
    const postId = req.params.postId;
    Post.findOne({
        where: { postID: postId },
        include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'username'] },
            {
                model: Courses, as: 'course', attributes: ['courseTitle'], include: [
                    {
                        model: Subject, as: 'subject', attributes: ['courseNumber'], include: [
                            { model: CourseCode, as: 'courseCode', attributes: ['courseCode'] }
                        ]
                    }
                ]
            }
        ],
        order: [
            ['post_date', 'DESC']
        ]
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// get first 5 verified post by course
exports.getVerifiedPostByCourse = async (req, res) => {
    const courseId = req.params.courseId;

    Post.findAll({
        where: {
            courseID: courseId,
            is_post_verified: true
        },
        include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'username', 'roleID'] },
            {
                model: Courses, as: 'course', attributes: ['courseTitle'], include: [
                    {
                        model: Subject, as: 'subject', attributes: ['courseNumber'], include: [
                            { model: CourseCode, as: 'courseCode', attributes: ['courseCode'] }
                        ]
                    }
                ]
            }
        ],
        order: [
            ['post_date', 'DESC']
        ],
        limit: 5
    }).then(result => {
        res.status(StatusCode.SuccessOK).send(result)
    }).catch(err => {
        res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
    })
}

// delete post
exports.deletePost = async (req, res, next) => {
    const postId = req.body.postId;
    Post.findByPk(postId)
        .then(post => {
            return post.destroy();
        }).then(result => {
            io.getIO().emit('posts', { action: 'delete', post: result });
            res.status(StatusCode.SuccessOK).send({ message: `'${result.post_title}' Post deleted.` });
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}

// Edit post
exports.editPost = async (req, res, next) => {
    const postId = req.body.postId;
    const postTitle = req.body.postTitle;
    const postText = req.body.postText;
    const postImagePath = req.body.postImagePath;
    Post.findByPk(postId)
        .then(post => {
            post.post_title = postTitle;
            post.post_text = postText;
            post.post_image_path = postImagePath;
            return post.save();
        }).then(result => {
            io.getIO().emit('posts', { action: 'edit', post: result });
            res.status(StatusCode.SuccessOK).send({ message: `Post '${result.postID}' updated.` });
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        });
}

// Update post to verified
exports.updateVerification = async (req, res, next) => {
    const postId = req.body.postId;
    const isVerified = req.body.isVerified
    const roleId = req.body.roleId;
    const userId = req.body.userId;
    const courseId = req.body.courseId;

    let isTeacher = false;
    let isTutor = false;
    //Search Teacher for a course
    await Teacher.findAll({
        where: {
            courseID: courseId,
        }
    }).then(teacher => {
        for (let i = 0; i < teacher.length; i++) {
            let teacherUserID = teacher[i].dataValues.userID
            if (teacherUserID === userId) {
                isTeacher = true;
                break;
            }
        }
    }).catch(err => {
        console.log(err)
    })

    //Search Tutor for a course
    await Tutor.findAll({
        where: {
            courseID: courseId,
        }
    }).then(tutor => {
        for (let i = 0; i < tutor.length; i++) {
            let tutorUserID = tutor[i].dataValues.userID
            if (tutorUserID === userId) {
                isTutor = true;
                break;
            }
        }
    }).catch(err => {
        console.log(err)
    })

    if (roleId == 3 || isTeacher || isTutor) {
        Post.findByPk(postId)
            .then(post => {
                post.is_post_verified = isVerified
                return post.save();
            }).then(result => {
                io.getIO().emit('posts', { action: 'verified', post: result });
                res.status(StatusCode.SuccessOK).send({ message: `Success '${isVerified}'.` });
            }).catch(err => {
                console.log(err)
                res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
            });
    } else {
        res.status(StatusCode.ClientErrorBadRequest).send({ message: "Not authorized to verify/un-verify" });
    }

}

