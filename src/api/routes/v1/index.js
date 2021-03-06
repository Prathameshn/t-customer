const express = require('express');
const authRoutes = require('./auth.route');
const customerRoutes = require('./customer.route');
const feedRoutes = require("./feed.route");
const feedLikeRoutes = require("./feed.like.route");
const feedCommentRoutes = require("./feed.comment.route");
const communityRoutes = require("./community.route");
const connectionRequestRoutes = require("./connection.request.route");
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
router.use('/', customerRoutes);
router.use('/feed', feedRoutes);
router.use('/feedLike', feedLikeRoutes);
router.use('/feedComment', feedCommentRoutes);
router.use('/community', communityRoutes);
router.use('/connectionRequest', connectionRequestRoutes);


module.exports = router;
