const httpStatus = require('http-status');
const { omit } = require('lodash');
const FeedComment = require("@models/feed.comment.model")
const APIError = require('@utils/APIError');


/**
 * Load FeedComment and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
   try {
      const feedComment = await FeedComment.get(id);
      req.locals = { feedComment };
      return next();
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Get feedComment
 * @public
 */
exports.get = (req, res) => res.json(req.locals.feedComment);

/**
 * Create new feedComment
 * @public
 */
exports.create = async (req, res, next) => {
   try {
      const feedComment = new FeedComment(req.body);
      const savedFeedComment = await feedComment.save();
      req.locals = { feedComment:savedFeedComment }
      next()
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Replace existing feedComment
 * @public
 */
exports.replace = async (req, res, next) => {
   try {
      const { feedComment } = req.locals;
      const newFeedCommentDetails = new FeedComment(req.body);
      const newFeedComment = omit(newFeedCommentDetails.toObject(), '_id');

      await feedComment.updateOne(newFeedComment, { override: true, upsert: true });
      const savedFeedComment = await FeedComment.findById(feedComment._id);

      res.json(savedFeedComment.transform());
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Update existing feedComment
 * @public
 */
exports.update = (req, res, next) => {
   const updatedFeedComment = omit(req.body);
   const feedComment = Object.assign(req.locals.feedComment, updatedFeedComment);

   feedComment.save()
      .then(savedFeedComment =>{
         req.locals = { feedComment:savedFeedComment }
         next()
      })
      .catch(e => next(new APIError(e)));
};

/**
 * Get feedComment list
 * @public
 */
exports.list = async (req, res, next) => {
   try {
      const feedComments = await FeedComment.list(req.query);
      res.json(feedComments);
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Delete feedComment
 * @public
 */
exports.remove = (req, res, next) => {
   const { feedComment } = req.locals;

   feedComment.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch(e => next(new APIError(error)));
};
