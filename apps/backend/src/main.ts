import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: `${process.env.IP_ADDRESS!}:5173`,
    }
})

const socketIdToUsername = new Map<string, string>()

io.on('connection', (socket) => {
    socket.on('name', (name: string) => {
        socketIdToUsername.set(socket.id, name)
        io.emit('users', [...socketIdToUsername.values()])
        io.emit('message', {
            user: "Server",
            message: `${name} has joined the chat.`
        })
    })

    socket.on('message', (message: string) => {
        const username = socketIdToUsername.get(socket.id)
        if (!username) {
            return
        }
        io.emit('message', {
            user: username,
            message
        })
    })

    socket.on('disconnect', () => {
        const username = socketIdToUsername.get(socket.id)
        if (!username) {
            return
        }
        socketIdToUsername.delete(socket.id)
        io.emit('users', [...socketIdToUsername.values()])
        io.emit('message', {
            user: "System",
            message: `${username} has left the chat.`
        })
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, '0.0.0.0' as unknown as number, () => {
    console.log(`Server listening on port ${PORT}`)
})