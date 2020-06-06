const generateMessage = (text) => {
    return {
        text,
        timestamp : new Date().getTime()
    }
}

const generateLocationMessage = (url) => {
    return {
        url: url,
        timestamp: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}