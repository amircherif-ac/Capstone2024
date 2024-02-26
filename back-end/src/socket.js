const socketio = require('socket.io-client')

/**
 * @type {socketio.Socket}
 */
let io;

module.exports = {
    init: connection => {
        io = connection
        return io;
    },

    /**
     * 
     * @returns {socketio.Socket}
     */
    getIO: () => {
        if (!io) {
            throw new Error('websocket server connection not established');
        }
        return io;
    }
};
