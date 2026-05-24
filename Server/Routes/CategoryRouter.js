const express =require('express')

const categoryController = require('../Controllers/CategoryController')

const categoryRouter=express.Router()

categoryRouter.get('/',categoryController.getAllCategorys)
categoryRouter.get('/:id',categoryController.getCategoryById)
categoryRouter.delete('/:categoryCode',categoryController.deleteCategory)
categoryRouter.post('/',categoryController.addNewCategory)
categoryRouter.put('/:id',categoryController.updateCategory)

module.exports=categoryRouter
