module.exports = {
    HOST: 'database',
    DB: 'study_hero',
    USER: 'root',
    PASSWORD: 'test',
    dialect: 'mysql',
    pool: {
        max: 5, //  Maximum number of connection in pool
        min: 0, // Minimum number of connection in pool
        acquire: 60000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000, // The time interval, in milliseconds, after which sequelize-pool will remove idle connections
    }
}
