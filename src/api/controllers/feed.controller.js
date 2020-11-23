const httpStatus = require('http-status');
const { omit } = require('lodash');
const Feed = require("@models/feeds.model")
const APIError = require('@utils/APIError');


/**
 * Load Feed and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
   try {
      const feed = await Feed.get(id);
      req.locals = { feed };
      return next();
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Get feed
 * @public
 */
exports.get = (req, res) => res.json(req.locals.feed);

/**
 * Create new feed
 * @public
 */
exports.create = async (req, res, next) => {
   try {
      const feed = new Feed(req.body);
      const savedFeed = await feed.save();
      req.locals = { feed:savedFeed }
      next()
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Replace existing feed
 * @public
 */
exports.replace = async (req, res, next) => {
   try {
      const { feed } = req.locals;
      const newFeedDetails = new Feed(req.body);
      const newFeed = omit(newFeedDetails.toObject(), '_id');

      await feed.updateOne(newFeed, { override: true, upsert: true });
      const savedFeed = await Feed.findById(feed._id);

      res.json(savedFeed.transform());
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Update existing feed
 * @public
 */
exports.update = (req, res, next) => {
   const updatedFeed = omit(req.body);
   const feed = Object.assign(req.locals.feed, updatedFeed);

   feed.save()
      .then(savedFeed =>{
         req.locals = { feed:savedFeed }
         next()
      })
      .catch(e => next(new APIError(e)));
};

/**
 * Get feed list
 * @public
 */
exports.list = async (req, res, next) => {
   try {
      const feeds = await Feed.list(req.query);
      res.json(feeds);
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Delete feed
 * @public
 */
exports.remove = (req, res, next) => {
   const { feed } = req.locals;

   feed.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch(e => next(new APIError(error)));
};
