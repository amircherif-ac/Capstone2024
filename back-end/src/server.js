require('dotenv').config({ path: __dirname + '/.env' })
const http = require('http')
const express = require("express");
const cors = require('cors');
const app = express();
const P0RT = process.env.PORT || 5000;
const socket = require('socket.io-client')
const globalSocket = require('./socket')
const os = require('process')

// Middleware
// open the port to the front-end
app.use(cors());
// Parse the body request into json format
app.use(express.json())
// Parse the body request from the URL into json format
app.use(express.urlencoded({ extended: true }))

// Allow the authentication of JWT from the client to be sent
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Redirect request to user endpoint 
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);
// Redirect request to course endpoint 
const courseRoutes = require('./routes/coursesRoutes');
app.use('/api/courses', courseRoutes);
// Redirect request to role endpoint 
const roleRoutes = require('./routes/roleRoutes');
app.use('/api/role', roleRoutes);
// Redirect request to tutor endpoint 
const tutorRoutes = require('./routes/tutorRoutes');
app.use('/api/tutor', tutorRoutes);
// Redirect request to enrolled endpoint 
const enrolledRoutes = require('./routes/enrolledRoutes');
app.use('/api/enrollment', enrolledRoutes);
// Redirect request to direct messages endpoint 
const DM_Routes = require('./routes/DM_Routes');
app.use('/api/dm', DM_Routes);
// Redirect request to posts endpoint 
const postRoutes = require('./routes/postRoutes');
app.use('/api/post', postRoutes);
// Redirect request to reply endpoint 
const replyRoutes = require('./routes/replyRoutes');
app.use('/api/reply', replyRoutes);
// Redirect request to thread endpoint 
const threadRoutes = require('./routes/threadRoutes');
app.use('/api/thread', threadRoutes);
// Redirect request to calendar endpoint 
const calendarRoutes = require('./routes/calendarRoutes');
app.use('/api/calendar', calendarRoutes);
// Redirect request to guest endpoint 
const guestRoutes = require('./routes/guestRoutes');
app.use('/api/guest', guestRoutes);
// Redirect request to tutor endpoint 
const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/teacher', teacherRoutes);


app.get("/", (req, res) => {
    console.log("Got request from frontend!")

    res.statusCode = StatusCode.SuccessOK;
    res.send({ message: "Hello COEN/ELEC 490!" })
})

const httpServer = http.createServer(app);

httpServer.listen(P0RT, () => {
    console.log("backend server listening on port", P0RT)
});

const wsServerConnection = socket.io(process.env.WEBSOCKET_SERVER_HOST + `?accessToken=${process.env.SOCKET_SECRET}`, {
    reconnection: true,
})

console.log('connecting to websocket server...')

let attempt = 1
let connectionInterval = setInterval(() => {
    if (attempt >= 5) {
        console.log(`error: could not establish websocket server connection. exiting...`)
        os.exit(1)
    }

    if (!wsServerConnection.connected) {
        console.log(`connection attempt to websocket server ${attempt}...`)
        attempt += 1
        return
    }

    clearInterval(connectionInterval)
    console.log('connection to websocket server established!')
    globalSocket.init(wsServerConnection)
}, 1000);

