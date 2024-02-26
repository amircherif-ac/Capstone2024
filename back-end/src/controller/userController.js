const db = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken');
//const socket = require('../socket')
const { StatusCode } = require('status-code-enum');
const url = require('url')
const { verify } = require('jsonwebtoken')
const axios = require('axios')
require("dotenv").config({ path: 'back-end\.env' });

// create models
const User = db.users
const Role = db.role

let onlineUsers = new Map();

// Create user
const register = async (req, res) => {
    try {
        const { password, username, firstName,
            lastName, email, schoolID, roleID } = req.body;
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();

        let createAtDate = `${year}-${month}-${day} ${hour}:${min}:${sec}`;

        let data = {
            username: `${username}`,
            secret: "1234",
            email: `${username}@mail.com`,
            first_name: `${firstName}`,
            last_name: `${lastName}`
        };

        var config = {
            method: 'post',
            url: 'https://api.chatengine.io/users/',
            headers: {
                'PRIVATE-KEY': process.env.PRIVATE_KEY_MESSAGING
            },
            data: data
        };

        // Find one user that have at least the same username, email or schoolID
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        })

        // Check if user exist
        if (!user) {
            // If not create the user
            bcrypt
                .hash(password, 12)
                .then((hash) => {
                    const user = User.create({
                        username: username,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        schoolID: schoolID,
                        passwordHASH: hash,
                        registeredAT: createAtDate,
                        //lastLogin: createAtDate,
                        roleID: roleID
                    })
                    // User successfully logged in, generate accessToken

                    // Create user for chat engine
                    axios(config)
                        .then(function (response) {
                            // console.log(JSON.stringify(response.data));
                            console.log(response.status);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });


                    console.log(user)
                    const accessToken = jwt.sign(
                        {
                            username: user.username,
                            id: user.userID
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '3h' }
                    );
                    res.status(StatusCode.SuccessCreated).send({ accessToken: accessToken, username: user.username })
                })
        } else {
            res.status(StatusCode.ServerErrorInternal).send('User already exist')
        }
    } catch (err) {
        res.status(StatusCode.ServerErrorInternal).json({ message: err.message })
    }

}

// Check Login
const login = async (req, res) => {
    try {
        const { username, password, email, schoolID } = req.body;

        // Find one user that have at least the same username, email or schoolID
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        })
        // Check if the user exist
        if (!user) {
            res.status(StatusCode.ClientErrorForbidden).send('User not found')
        } else {
            // Check/compare the user's password
            bcrypt.compare(password, user.passwordHASH).then((match) => {
                if (!match) {
                    res.status(StatusCode.ClientErrorForbidden).send('Password was incorrect')
                } else {
                    // User successfully logged in, generate accessToken
                    const accessToken = jwt.sign(
                        {
                            username: user.username,
                            userID: user.userID,
                            roleID: user.roleID
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '3h' }
                    );

                    // Send back accessToken 
                    res.status(StatusCode.SuccessOK).send({ accessToken: accessToken, userID: user.userID, username: user.username, roleID: user.roleID });
                }
            })
        }
    } catch (err) {
        res.status(StatusCode.ServerErrorInternal).json({ message: err.message })
    }
}

// get all user
const getAllUsers = async (req, res) => {
    try {
        let user = await User.findAll()
        res.status(StatusCode.SuccessOK).send(user)
    } catch (err) {
        res.status(StatusCode.ServerErrorInternal).json({ message: err.message })
    }
}

// Get specified user
const getSpecificUser = async (req, res) => {
    try {
        let userId = req.params.userId;
        let user = await User.findOne({ where: { userID: userId }, include: [{ model: Role, as: 'role' }] })
        res.status(StatusCode.SuccessOK).send(user)
    } catch (err) {
        res.status(StatusCode.ServerErrorInternal).json({ message: err.message })
    }

}

// get specific userId with the use of their username
const getUserWithUsername = async (req, res) => {
    try {
        const username = req.params.selectedUsername;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            res.status(StatusCode.ClientErrorNotFound).json({ message: `User with username ${username} not found.` });
            return;
        }
        res.status(StatusCode.SuccessOK).json({ userID: user.userID });
    } catch (err) {
        console.error(err);
        res.status(StatusCode.ServerErrorInternal).json({ message: `Error retrieving user with username ${req.params.selectedUsername}.` });
    }
};


// Update user
const updateUser = async (req, res) => {
    try {
        const userId = req.body.userId
        const info = {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            schoolID: req.body.schoolId,
            roleID: req.body.roleId
        }
        const user = await User.update(info, {
            where: {
                userID: userId
            }
        })
        res.status(StatusCode.SuccessOK).send(user)
    } catch (err) {
        res.status(StatusCode.ServerErrorInternal).json({ message: err.message })
    }
}

// update password
const updatePassword = async (req, res, next) => {
    const userId = req.body.userId;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    User.findByPk(userId)
        .then(user => {
            // Check/compare the user's password 
            bcrypt.compare(oldPassword, user.passwordHASH).then((match) => {
                if (!match) {
                    res.status(StatusCode.ClientErrorForbidden).send('Password was incorrect')
                } else {
                    // Encrypt the password
                    bcrypt
                        .hash(newPassword, 12)
                        .then((hash) => {
                            user.passwordHASH = hash;
                            user.save();
                        })

                    // Password Changed, generate new accessToken
                    const accessToken = jwt.sign(
                        {
                            username: user.username,
                            id: user.userID
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: '2h' }
                    );
                    // Send back accessToken 
                    res.status(StatusCode.SuccessOK).send({ accessToken: accessToken, msg: "Password Changed" });
                }
            })
        }).catch(err => {
            res.status(StatusCode.ServerErrorInternal).send({ message: err.message });
        })
}

// Delete specified user
const deleteUser = async (req, res) => {
    try {
        let username = req.body.username;
        await User.destroy({ where: { username: username } });
        res.status(StatusCode.SuccessOK).send('user is deleted');
    } catch (err) {
        res.status(StatusCode.ServerErrorInternal).json({ message: err.message });
    }

}

module.exports = {
    register,
    login,
    getAllUsers,
    getSpecificUser,
    updateUser,
    updatePassword,
    deleteUser,
    getUserWithUsername
}
