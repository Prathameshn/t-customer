const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { omitBy, isNil } = require('lodash');
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const ObjectId = Schema.Types.ObjectId

var connectionRequestSchema = new Schema({
    from:{ type: ObjectId , ref:'Customer'},
    to:{ type: ObjectId , ref:'Customer'},
    status:{ type: String, default:'REQUESTED', enum:['REQUESTED','ACCEPTED','CANCELLED','REJECTED','BLOCKED']}
},
  { timestamps: true }
)

connectionRequestSchema.index({ 'customer': 1})

connectionRequestSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "from",
      "to",
      "status",
      "createdAt",
      "updatedAt",
      "id"
    ];
    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

connectionRequestSchema.statics = {
  /**
   * Get connectionRequest Type
   *
   * @param {ObjectId} id - The objectId of connectionRequest Type.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let connectionRequest;
      if (mongoose.Types.ObjectId.isValid(id)) {
        connectionRequest = await this.findById(id).exec();
      }
      if (connectionRequest && !connectionRequest.isDeleted) {
        return connectionRequest
      }

      throw new APIError({
        message: "Connection request does not exist",
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List connectionRequest Types in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of connectionRequest types to be skipped.
   * @param {number} limit - Limit number of connectionRequest types to be returned.
   * @returns {Promise<Subject[]>}
   */
  async list({ page = 1, perPage = 30, to,from }) {
    const options = omitBy({ to,from }, isNil);

    let connectionRequests = await this.find(options)
      .populate('to from','_id firstName lastName picture')
      .sort({ createdAt: -1 })
      .skip(perPage * (page * 1 - 1))
      .limit(perPage * 1)
      .exec();
    connectionRequests = connectionRequests.map((connectionRequest) => connectionRequest.transform());
    var count = await this.find(options).exec();
    count = count.length;
    var pages = Math.ceil(count / perPage);

    return { connectionRequests, count, pages };
  },
};

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema)
