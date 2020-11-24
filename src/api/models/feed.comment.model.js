const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { omitBy, isNil } = require('lodash');
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const ObjectId = Schema.Types.ObjectId

var feedCommentSchema = new Schema({
    feed:{ type: ObjectId,ref:'Feed'},
    customer:{ type: ObjectId , ref:'Customer'},
    isDeleted:{ type: Boolean},
    isEdited:{ type: Boolean},
    comment:{ type: String ,required:true}
},
  { timestamps: true }
)

feedCommentSchema.index({ 'customer': 1})

feedCommentSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "feed",
      "customer",
      "isDeleted",
      "isEdited",
      "comment",
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

feedCommentSchema.statics = {
  /**
   * Get feedComment Type
   *
   * @param {ObjectId} id - The objectId of feedComment Type.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let feedComment;
      if (mongoose.Types.ObjectId.isValid(id)) {
        feedComment = await this.findById(id).exec();
      }
      if (feedComment && !feedComment.isDeleted) {
        return feedComment
      }

      throw new APIError({
        message: "Feed comment does not exist",
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List feedComment Types in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of feedComment types to be skipped.
   * @param {number} limit - Limit number of feedComment types to be returned.
   * @returns {Promise<Subject[]>}
   */
  async list({ page = 1, perPage = 30, createdBy }) {
    const options = omitBy({ createdBy, isDeleted }, isNil);

    let feedComments = await this.find(options)
      .populate('customer','_id firstName lastName picture')
      .sort({ createdAt: -1 })
      .skip(perPage * (page * 1 - 1))
      .limit(perPage * 1)
      .exec();
    feedComments = feedComments.map((feedComment) => feedComment.transform());
    var count = await this.find(options).exec();
    count = count.length;
    var pages = Math.ceil(count / perPage);

    return { feedComments, count, pages };
  },
};

module.exports = mongoose.model("FeedComment", feedCommentSchema)
