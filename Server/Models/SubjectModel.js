const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({

    subjectCode: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        required: true
    },
    managerApproved: {
        type: Boolean,
        default: true
    },
    requestedByUserCode: {
        type: String,
        default: ""
    },
    categoryCode: {
        type: String,
        default: ""
    }
})
const Subject = mongoose.model('Subject', subjectSchema)
module.exports=Subject