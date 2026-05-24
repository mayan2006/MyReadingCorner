const express =require('express')

const markedBookController = require('../Controllers/MarkedBookController')

const markedBookRouter=express.Router()

markedBookRouter.get('/',markedBookController.getAllMarkedBook)
markedBookRouter.get('/:id',markedBookController.getMarkedBookById)
markedBookRouter.delete('/:bookCode',markedBookController.deleteMarkedBook)
markedBookRouter.post('/',markedBookController.addNewMarkedBook)
markedBookRouter.put('/:id',markedBookController.updateMarkedBook)

module.exports=markedBookRouter

