const express = require('express');
const validate = require('express-validation');
const controller = require('@controllers/auth.controller');

const router = express.Router();

router.route('/register')
  .post(controller.register);

module.exports = router;
