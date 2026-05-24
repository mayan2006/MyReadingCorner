const mongoose = require('mongoose')

const freeWritingSchema = new mongoose.Schema({

    writingCode:{
        type:String,
        required:true
    },
    subjectCode:{
        type:String,
        required:true
    },
    userCode:{
         type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    chapter:{
        type:Number,
        required:true 
    },
    name:{
        type:String,
        required:true
    },
    summary:{
        type:String,
        required:true
    },
      content: {
        type: String,
        required: true
    },
    date:{
        type:Date,
        required:true
    },
    isApproved:{
        type:Boolean,
        required:true
    },
    seriesCode: {
        type: String
    },
    img: {
        type: String,
        default: ""
    }

})
const FreeWriting = mongoose.model('FreeWriting', freeWritingSchema)
module.exports=FreeWriting