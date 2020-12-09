const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Feed = new Schema({
    "username": String,
    "drawing": String,
    "title": String,
})

module.exports = mongoose.model('Feed', Feed)