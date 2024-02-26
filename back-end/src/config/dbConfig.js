require('dotenv').config()
module.exports = {
    HOST: process.env.DB_HOST,
    DB: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    dialect: 'mysql',
    pool:{
        max: 100, //  Maximum number of connection in pool
        min: 0, // Minimum number of connection in pool
        acquire: 60000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000, // The time interval, in milliseconds, after which sequelize-pool will remove idle connections
    }
}
