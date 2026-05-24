const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({

    categoryCode:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    }
})
const Category = mongoose.model('Category', categorySchema)
module.exports=Category;