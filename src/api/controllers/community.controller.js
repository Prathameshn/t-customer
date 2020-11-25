const httpStatus = require('http-status');
const { omit } = require('lodash');
const Community = require("@models/community.model")
const APIError = require('@utils/APIError');


/**
 * Load Community and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
   try {
      const community = await Community.get(id);
      req.locals = { community };
      return next();
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Get community
 * @public
 */
exports.get = (req, res) => res.json(req.locals.community);

/**
 * Create new community
 * @public
 */
exports.create = async (req, res, next) => {
   try {
      const community = new Community(req.body);
      const savedCommunity = await community.save();
      res.json(savedCommunity)
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Replace existing community
 * @public
 */
exports.replace = async (req, res, next) => {
   try {
      const { community } = req.locals;
      const newCommunityDetails = new Community(req.body);
      const newCommunity = omit(newCommunityDetails.toObject(), '_id');

      await community.updateOne(newCommunity, { override: true, upsert: true });
      const savedCommunity = await Community.findById(community._id);

      res.json(savedCommunity.transform());
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Update existing community
 * @public
 */
exports.update = (req, res, next) => {
   const updatedCommunity = omit(req.body);
   const community = Object.assign(req.locals.community, updatedCommunity);

   community.save()
      .then(savedCommunity =>{
         res.json(savedCommunity)
      })
      .catch(e => next(new APIError(e)));
};

/**
 * Get community list
 * @public
 */
exports.list = async (req, res, next) => {
   try {
      const communitys = await Community.list(req.query);
      res.json(communitys);
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Delete community
 * @public
 */
exports.remove = (req, res, next) => {
   const { community } = req.locals;

   community.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch(e => next(new APIError(error)));
};
