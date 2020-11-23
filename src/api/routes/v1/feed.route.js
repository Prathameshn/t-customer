const express = require('express');
const controller = require('@controllers/feed.controller');
const { authorize } = require('@middlewares/auth');
const customerService = require("@services/customer.service")
const multer = require("multer")

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
       cb(null, 'public/Feed')
   },
   
   filename: function (req, file,cb) {
       let filename = file.originalname.replace(/\s+/g, '').trim()
       filename = `${new Date().getTime()}_${filename}`
       cb(null, filename)
   }
});

const fileFilter = (req,file,cb) => {
   if(file.mimetype === "image/jpg"  || 
      file.mimetype === "image/jpeg"  || 
      file.mimetype ===  "image/png" ||
      file.mimetype ===  "video/mp4"){
     cb(null, true);
   }else{
     cb(new Error("Image uploaded is not of type jpg/jpeg or png video/mp4"),false);
   }
}

const upload = multer({storage: storage, fileFilter : fileFilter});

const router = express.Router();

router.param('feedId', controller.load);

router
   .route('/')
   .get(authorize(),controller.list)
   .post(authorize(),customerService.setCustomer,upload.array('file'),controller.setMedia,controller.compressImage,controller.create)
   
router
   .route('/:feedId')
   .get(authorize(), controller.get)
   .put(authorize(), controller.replace)
   .patch(authorize(),upload.array('file'),controller.setMedia,controller.compressImage,controller.update)
   .delete(authorize(), controller.remove);


module.exports = router;