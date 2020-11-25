const express = require('express');
const controller = require('@controllers/customer.controller');
const feedService = require('@services/feed.service');
const connectionService = require('@services/connection.request.service');
const { authorize } = require('@middlewares/auth');

const router = express.Router();

router
   .route('/')
   .get(authorize(), controller.loggedIn)
   .patch(authorize(), controller.update)

router
   .route('/getMyPost')
   .get(authorize(), feedService.getMyPost)

router
   .route('/getMyInnovation')
   .get(authorize(), feedService.getMyInnovation)

router
   .route('/getMyRequest')
   .get(authorize(), connectionService.getMyRequest)

router
   .route('/getMyRequester')
   .get(authorize(), connectionService.getMyRequester)


module.exports = router;
