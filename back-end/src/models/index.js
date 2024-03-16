const dbConfig = require('../config/dbConfig');
const initModels = require('./init-models').initModels

const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        operatorsAliases: false,
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        },
        logging: false,
    }
)

sequelize.authenticate()
    .then(() => {
        console.log('connected to mysql database')
    })
    .catch(err => {
        console.log('Error' + err)
    })

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// db.users = require('./users.js')(sequelize, DataTypes)
let models = initModels(sequelize)
db.users = models.users
db.tutor = models.tutor
db.teacher = models.teacher
db.subject = models.subject
db.role = models.role
db.program = models.program
db.faculty = models.faculty
db.enrolled = models.enrolled
db.department = models.department
db.degree = models.degree
db.courses = models.courses
db.course_level = models.courselevel
db.course_codes = models.coursecodes
db.direct_message = models.direct_messages
db.post = models.posts
db.replies = models.replies
db.thread = models.threads
db.calendar = models.calendar
db.guest = models.meeting_guest
db.timespent = models.timespent
db.metrics_logs = models.metrics_logs

db.sequelize.sync()
    .then(() => {
        console.log('re-sync done')
    })
    .catch(err => {
        console.log('Error' + err)
    })

module.exports = db
