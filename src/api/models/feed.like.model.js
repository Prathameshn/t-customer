const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { omitBy, isNil } = require('lodash');
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const ObjectId = Schema.Types.ObjectId

var feedLikeSchema = new Schema({
    feed:{ type: ObjectId,ref:'Feed'},
    likedBy:{ type: ObjectId , ref:'Customer'},
    status:{ type: Boolean}
},
  { timestamps: true }
)

feedLikeSchema.index({ 'likedBy': 1})

feedLikeSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "feed",
      "likedBy",
      "status",
      "createdAt",
      "updatedAt"
    ];
    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

feedLikeSchema.statics = {
  /**
   * Get feedLike Type
   *
   * @param {ObjectId} id - The objectId of feedLike Type.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let feedLike;
      if (mongoose.Types.ObjectId.isValid(id)) {
        feedLike = await this.findById(id).exec();
      }
      if (feedLike) {
        return feedLike
      }

      throw new APIError({
        message: "Feed Like does not exist",
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List feedLike Types in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of feedLike types to be skipped.
   * @param {number} limit - Limit number of feedLike types to be returned.
   * @returns {Promise<Subject[]>}
   */
  async list({ page = 1, perPage = 30, createdBy }) {
    const options = omitBy({ createdBy }, isNil);

    let feedLikes = await this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page * 1 - 1))
      .limit(perPage * 1)
      .exec();
    feedLikes = feedLikes.map((feedLike) => feedLike.transform());
    var count = await this.find(options).exec();
    count = count.length;
    var pages = Math.ceil(count / perPage);

    return { feedLikes, count, pages };
  },
};

module.exports = mongoose.model("FeedLike", feedLikeSchema)
