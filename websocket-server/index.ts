import { createServer } from 'http'
import { SocketServer } from './socket/server'
import config from './config.json'
import { ConfigReader } from './config'
import { SocketHandler } from './handlers/interface'
import { SessionHandler } from './handlers/session'

const main = () => {
    const httpServer = createServer()

    const handlers: SocketHandler[] = []
    handlers.push(new SessionHandler())

    const socketServer = new SocketServer(httpServer, handlers)

    new ConfigReader(config)

    httpServer.listen(config.PORT, () => {
        console.log('socket server ready to accept connections on port ' + config.PORT)
    })
}

main();
