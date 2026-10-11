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

freeWritingSchema.index({ writingCode: 1 }, { unique: true });
freeWritingSchema.index({ seriesCode: 1 });
freeWritingSchema.index({ userCode: 1 });
freeWritingSchema.index(
    { name: "text", author: "text", summary: "text" },
    { default_language: "none", weights: { name: 5, author: 3, summary: 1 } }
);

const FreeWriting = mongoose.model('FreeWriting', freeWritingSchema)
module.exports=FreeWriting