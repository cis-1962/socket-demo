import { io } from 'socket.io-client'
import './App.css'
import { useState } from 'react'

const socket = io(`${process.env.IP_ADDRESS}:3000`, {
    autoConnect: false
})

interface Message {
    user: string
    message: string
}

function App() {
    const [connected, setConnected] = useState(false)

    const [username, setUsername] = useState('')
    const [users, setUsers] = useState<string[]>([])

    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<Message[]>([])

    const joinChat = () => {
        console.log('Joining chat')
        socket.connect()
        socket.emit('name', username)

        socket.on('users', (users: string[]) => {
            setUsers(users)
        })
        socket.on('message', (message: Message) => {
            setMessages((messages) => [...messages, message])
        })

        setConnected(true)
    }

    const disconnectChat = () => {
        socket.disconnect()
        setConnected(false)
    }

    if (!connected) {
        return (
            <>
                <h1>Chat</h1>
                <form onSubmit={joinChat}>
                    <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username} />
                    <button>Join Chat</button>
                </form>
            </>
        )
    }

    return (
        <>
            <h1>Chat</h1>
            <button type="button" onClick={disconnectChat}>Leave Chat</button>
            <h2>List of Users</h2>
            {users.map((user, index) => {
                return (
                    <p key={index}>{user}</p>
                )
            })}
            <h2>Messages</h2>
            {messages.map((message, index) => {
                return (
                    <p key={index}><strong>{message.user}</strong>: {message.message}</p>
                )
            })}
            <form onSubmit={(e) => {
                e.preventDefault()
                if (message.length == 0) return
                console.log("SENDING MESSAGe")
                socket.emit('message', message)
                setMessage('')
            }}>
                <input type="text" placeholder="Message" onChange={(e) => setMessage(e.target.value)} value={message} />
                <button>Send Message</button>
            </form>
        </>
    )
}

export default App
