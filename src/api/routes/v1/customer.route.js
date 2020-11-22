const express = require('express');
const controller = require('@controllers/customer.controller');
const { authorize } = require('@middlewares/auth');

const router = express.Router();

router
   .route('/')
   .get(authorize(), controller.loggedIn)
   .patch(authorize(), controller.update)

module.exports = router;
