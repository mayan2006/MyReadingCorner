const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({

    bookCode: {
        type: String,
        required: true
    },
    categoryCode: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
})
const Book = mongoose.model('Book', bookSchema)
module.exports=Book