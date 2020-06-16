const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage } = require('./utils/messages')
const { generateLocationMessage } = require('./utils/messages') 
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

//Define paths for express config
const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))

// app.get('/', (req,res) => {
//     res.render('index')
// })

let count = 0

io.on('connection', (socket) => {
    console.log('New Websocket connection')

    socket.on('join', ({ username, room }, callback) => {
       const { error, user } = addUser( {
            id: socket.id,
            username,
            room
        })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))

        io.to(user.room).emit('usersList',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        
        if(filter.isProfane(message)) {
            return callback("Profanity is not allowed")
        }

        const user = getUser(socket.id)

        //User emits message to other users
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()

    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('disconnectMessage', generateMessage('Admin',`${user.username} has left the chat`))

            io.to(user.room).emit('usersList', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        

        
    })

})




server.listen(port, () => {
    console.log(`App listening on port ${port}`)
})