const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Canvas = new Schema({
    
    drawing: String,
    title: String
})

module.exports = mongoose.model('Canvas', Canvas)