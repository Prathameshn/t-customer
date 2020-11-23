const express = require('express');
const authRoutes = require('./auth.route');
const customerRoutes = require('./customer.route');
const feedRoutes = require("./feed.route");
const feedLikeRoutes = require("./feed.like.route");
const feedCommentRoutes = require("./feed.comment.route");
const router = express.Router();
/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));


/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/auth', authRoutes);
router.use('/customer', customerRoutes);
router.use('/feed', feedRoutes);
router.use('/feedLike', feedLikeRoutes);
router.use('/feedComment', feedCommentRoutes);

module.exports = router;
