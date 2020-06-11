const generateMessage = (username,text) => {
    return {
        username,
        text,
        timestamp : new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url: url,
        timestamp: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}