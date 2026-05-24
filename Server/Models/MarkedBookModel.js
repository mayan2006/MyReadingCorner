const mongoose = require('mongoose')

const markedBookSchema = new mongoose.Schema({

    bookCode: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    userCode: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    bookStatus: {
        type: String,
        required: true
    }
})
const MarkedBook = mongoose.model('MarkedBook', markedBookSchema)
module.exports=MarkedBook