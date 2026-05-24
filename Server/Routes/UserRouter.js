const express =require('express')
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const userController = require('../Controllers/UserController')

const userRouter=express.Router()
const uploadsDir = path.join(__dirname, "..", "uploads")
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const extension = path.extname(file.originalname || ".jpg")
    cb(null, `profile-${uniqueSuffix}${extension}`)
  }
})

const upload = multer({ storage })

userRouter.get('/',userController.getAllUsers)
userRouter.post('/login', userController.loginUser)
userRouter.get('/public/:userCode', userController.getPublicAuthorProfile)
userRouter.get('/:id',userController.getUserById)
userRouter.delete('/:userCode',userController.deleteUser)
userRouter.put('/:id',userController.updateUser)
userRouter.post('/upload-image', upload.single("image"), userController.updateUserImage)
userRouter.post('/',userController.addNewUser)

module.exports=userRouter
