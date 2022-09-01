const mongoose = require('mongoose')


const link = new mongoose.Schema({
    fulllink: {
        type: String,
        required: true
    },
    shortendedlink: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Link', link)