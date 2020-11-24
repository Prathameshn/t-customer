const express = require('express');
const controller = require('@controllers/connection.controller.controller');
const { authorize } = require('@middlewares/auth');

const router = express.Router();
/**
 * Load vitalRules when API with vitalRulesId route parameter is hit
 */
router.param('connectionRequestId', controller.load);


router
   .route('/')
   .get(authorize(),controller.list)
   .post(authorize(),controller.create)

router
   .route('/:connectionRequestId')
   .get(authorize(), controller.get)
   .put(authorize(), controller.replace)
   .patch(authorize(), controller.update)
   .delete(authorize(), controller.remove);

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