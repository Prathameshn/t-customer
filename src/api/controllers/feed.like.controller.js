const httpStatus = require('http-status');
const { omit } = require('lodash');
const FeedLike = require("@models/feed.like.model")
const APIError = require('@utils/APIError');


/**
 * Load FeedLike and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
   try {
      const feedLike = await FeedLike.get(id);
      req.locals = { feedLike };
      return next();
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Get feedLike
 * @public
 */
exports.get = (req, res) => res.json(req.locals.feedLike);

/**
 * Create new feedLike
 * @public
 */
exports.create = async (req, res, next) => {
   try {
      const feedLike = new FeedLike(req.body);
      const savedFeedLike = await feedLike.save();
      req.locals = { feedLike:savedFeedLike }
      next()
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Replace existing feedLike
 * @public
 */
exports.replace = async (req, res, next) => {
   try {
      const { feedLike } = req.locals;
      const newFeedLikeDetails = new FeedLike(req.body);
      const newFeedLike = omit(newFeedLikeDetails.toObject(), '_id');

      await feedLike.updateOne(newFeedLike, { override: true, upsert: true });
      const savedFeedLike = await FeedLike.findById(feedLike._id);

      res.json(savedFeedLike.transform());
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Update existing feedLike
 * @public
 */
exports.update = (req, res, next) => {
   const updatedFeedLike = omit(req.body);
   const feedLike = Object.assign(req.locals.feedLike, updatedFeedLike);

   feedLike.save()
      .then(savedFeedLike =>{
         req.locals = { feedLike:savedFeedLike }
         next()
      })
      .catch(e => next(new APIError(e)));
};

/**
 * Get feedLike list
 * @public
 */
exports.list = async (req, res, next) => {
   try {
      const feedLikes = await FeedLike.list(req.query);
      res.json(feedLikes);
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Delete feedLike
 * @public
 */
exports.remove = (req, res, next) => {
   const { feedLike } = req.locals;

   feedLike.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch(e => next(new APIError(error)));
};
