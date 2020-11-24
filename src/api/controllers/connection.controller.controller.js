const httpStatus = require('http-status');
const { omit } = require('lodash');
const ConnectionRequest = require("@models/connection.request.model")
const APIError = require('@utils/APIError');


/**
 * Load ConnectionRequest and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
   try {
      const connectionRequest = await ConnectionRequest.get(id);
      req.locals = { connectionRequest };
      return next();
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Get connectionRequest
 * @public
 */
exports.get = (req, res) => res.json(req.locals.connectionRequest);

/**
 * Create new connectionRequest
 * @public
 */
exports.create = async (req, res, next) => {
   try {
      const connectionRequest = new ConnectionRequest(req.body);
      const savedConnectionRequest = await connectionRequest.save();
      req.locals = { connectionRequest:savedConnectionRequest }
      res.json(req.locals.connectionRequest)
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Replace existing connectionRequest
 * @public
 */
exports.replace = async (req, res, next) => {
   try {
      const { connectionRequest } = req.locals;
      const newConnectionRequestDetails = new ConnectionRequest(req.body);
      const newConnectionRequest = omit(newConnectionRequestDetails.toObject(), '_id');

      await connectionRequest.updateOne(newConnectionRequest, { override: true, upsert: true });
      const savedConnectionRequest = await ConnectionRequest.findById(connectionRequest._id);

      res.json(savedConnectionRequest.transform());
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Update existing connectionRequest
 * @public
 */
exports.update = (req, res, next) => {
   const updatedConnectionRequest = omit(req.body);
   const connectionRequest = Object.assign(req.locals.connectionRequest, updatedConnectionRequest);

   connectionRequest.save()
      .then(savedConnectionRequest =>{
         req.locals = { connectionRequest:savedConnectionRequest }
         res.json(req.locals.connectionRequest)
      })
      .catch(e => next(new APIError(e)));
};

/**
 * Get connectionRequest list
 * @public
 */
exports.list = async (req, res, next) => {
   try {
      const connectionRequests = await ConnectionRequest.list(req.query);
      res.json(connectionRequests);
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Delete connectionRequest
 * @public
 */
exports.remove = (req, res, next) => {
   const { connectionRequest } = req.locals;

   connectionRequest.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch(e => next(new APIError(error)));
};
