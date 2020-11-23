const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { omitBy, isNil } = require('lodash');
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const ObjectId = Schema.Types.ObjectId

var feedSaveSchema = new Schema({
    feed:{ type: ObjectId,ref:'Feed'},
    customer:{ type: ObjectId , ref:'Customer'},
    status:{ type: Boolean},
    type : { type: String}
},
  { timestamps: true }
)

feedSaveSchema.index({ 'customer': 1})

feedSaveSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "feed",
      "customer",
      "status",
      "type",
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

feedSaveSchema.statics = {
  /**
   * Get feedSave Type
   *
   * @param {ObjectId} id - The objectId of feedSave Type.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let feedSave;
      if (mongoose.Types.ObjectId.isValid(id)) {
        feedSave = await this.findById(id).exec();
      }
      if (feedSave) {
        return feedSave
      }

      throw new APIError({
        message: "Feed Save does not exist",
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List feedSave Types in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of feedSave types to be skipped.
   * @param {number} limit - Limit number of feedSave types to be returned.
   * @returns {Promise<Subject[]>}
   */
  async list({ page = 1, perPage = 30, createdBy }) {
    const options = omitBy({ createdBy }, isNil);

    let feedSave = await this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page * 1 - 1))
      .limit(perPage * 1)
      .exec();
    feedSave = feedSave.map((feedSave) => feedSave.transform());
    var count = await this.find(options).exec();
    count = count.length;
    var pages = Math.ceil(count / perPage);

    return { feedSave, count, pages };
  },
};

module.exports = mongoose.model("FeedSave", feedSaveSchema)
