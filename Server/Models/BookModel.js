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

bookSchema.index({ bookCode: 1 }, { unique: true });
bookSchema.index(
    { title: "text", author: "text", summary: "text" },
    { default_language: "none", weights: { title: 5, author: 3, summary: 1 } }
);

const Book = mongoose.model('Book', bookSchema)
module.exports=Book