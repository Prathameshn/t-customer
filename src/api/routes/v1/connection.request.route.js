const express = require('express');
const controller = require('@controllers/connection.reqeust.controller');
const service = require('@services/connection.request.service');
const { authorize } = require('@middlewares/auth');

const router = express.Router();
/**
 * Load vitalRules when API with vitalRulesId route parameter is hit
 */
router.param('connectionRequestId', controller.load);


router
   .route('/')
   .get(authorize(),controller.list)
   .post(authorize(),service.setBodyForCreateConnection,service.checkExist,controller.create)

router
   .route('/:connectionRequestId')
   .get(authorize(), controller.get)
   .put(authorize(), controller.replace)
   .patch(authorize(), controller.update)
   .delete(authorize(), controller.remove);

router
   .route('/:connectionRequestId/acceptRequest')
   .patch(authorize(), service.acceptRequest, controller.update);

router
   .route('/:connectionRequestId/rejectRequest')
   .patch(authorize(),service.rejectRequest ,controller.update)

router
   .route('/:connectionRequestId/blockRequest')
   .patch(authorize(),service.blockRequest ,controller.update)

router
   .route('/:connectionRequestId/cancelRequest')
   .patch(authorize(),service.cancelRequest ,controller.update)
   

// router
//    .route("/connection/request/MyRequest")
//    .get(ConnectionRequestController.getMyRequest)
//    .post(ConnectionRequestController.createConnectionRequest)


// router
//    .route("/connection/request/getRequester")
//    .get(ConnectionRequestController.getMeRequester)

// router
//    .route("/connection/request/acceptRequest")
//    .patch(ConnectionRequestController.acceptRequest,CommunityController.addReceiverInSenderCommunity,CommunityController.addSenderInReceiverCommunity,ConnectionRequestController.acceptRequestRes)

// router
//    .route("/connection/request/rejectRequest")
//    .patch(ConnectionRequestController.rejectRequest)

// router
//    .route("/connection/request/getMyCommunity")
//    .get(CommunityController.getMyCommunity)


module.exports = router;