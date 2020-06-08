const socket = io()

//Elements
const $form = document.querySelector('#message-form')
const $messageFormInput = $form.querySelector('input')
const $messageFormButton = $form.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

let message;

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        url: message.url,
        timestamp: moment(message.timestamp).format("H:mm")

    })
    $messages.insertAdjacentHTML('beforeend', html)
})


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        timestamp: moment(message.timestamp).format("H:mm")
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('disconnectMessage', (message) => {
    console.log(message)
})

$form.addEventListener('submit', (e) => {
    
    e.preventDefault()

    //Disable form
    $messageFormButton.setAttribute('disabled','disabled')

    message = textMessage.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        
        if(error) {
            return console.log(error)
        }
        
        console.log("Message delivered")
    })
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('This browser does not support geolocation')
    }

    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("Location sent")
            $locationButton.removeAttribute('disabled')
        })
    })

})

socket.emit('join', { username,room });