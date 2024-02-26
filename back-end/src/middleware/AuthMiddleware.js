const jwt = require("jsonwebtoken")
const { StatusCode } = require('status-code-enum');
require("dotenv").config();

// Validate the token from the front end
// If yes continue with the request
// If not respond with error
const validateToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send("Unauthorized request");
    }

    const token = req.headers["authorization"].split(" ")[1];

    // Check if accessToken exist
    if (!token) {
        return res.status(StatusCode.ClientErrorUnauthorized).send({ error: "Access Denied" })
    }

    try {
        // Validate the accessToken from user by comparing the secret
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

        if (decodedToken) {
            // Place the user id of the token in the request
            req.body.userId = decodedToken.userID
            req.body.roleId = decodedToken.roleID
            // If success move forward with the request
            return next();
        }
    } catch (error) {
        return res.status(StatusCode.ServerErrorInternal).json({ error: error })
    }
};

module.exports = { validateToken }

// in axios in headers
/*
    accessToken: localStorage.getItem("accessToken")
*/
