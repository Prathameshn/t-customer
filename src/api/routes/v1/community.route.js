const express = require('express');
const controller = require('@controllers/community.controller');
const { authorize } = require('@middlewares/auth');

const router = express.Router();
/**
 * Load vitalRules when API with vitalRulesId route parameter is hit
 */
router.param('communityId', controller.load);


router
   .route('/')
   .get(authorize(),controller.list)
   .post(authorize(),controller.create)

router
   .route('/:communityId')
   .get(authorize(), controller.get)
   .put(authorize(), controller.replace)
   .patch(authorize(), controller.update)
   .delete(authorize(), controller.remove);


module.exports = router;