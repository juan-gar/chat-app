const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage } = require('./utils/messages')
const { generateLocationMessage } = require('./utils/messages') 


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

    

    socket.on('join', ({ username, room }) => {
        socket.join(room)
        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined`))

    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        
        if(filter.isProfane(message)) {
            return callback("Profanity is not allowed")
        }

        //User emits message to other users
        io.to('papawar ').emit('message', generateMessage(message))
        callback()

    })

    socket.on('sendLocation', (position, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`))

        callback()
    })

    socket.on('disconnect', () => {
        io.emit('disconnectMessage', generateMessage('User has left the chat'))
    })

})




server.listen(port, () => {
    console.log(`App listening on port ${port}`)
})