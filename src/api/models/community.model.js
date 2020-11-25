const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { omitBy, isNil } = require('lodash');
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const ObjectId = Schema.Types.ObjectId

var communitySchema = new Schema({
    customer:{ type: ObjectId , ref:'Customer'},
    community:{ 
      type : [{
        user :{ type:ObjectId, ref:'Customer'},
        createdAt:{type:Date,default:Date.now},
        updatedAt:{type:Date,default:Date.now}
      }]
    }
},
  { timestamps: true }
)

communitySchema.index({ 'customer': 1})

communitySchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "customer",
      "community",
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

communitySchema.statics = {
  /**
   * Get community Type
   *
   * @param {ObjectId} id - The objectId of community Type.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let community;
      if (mongoose.Types.ObjectId.isValid(id)) {
        community = await this.findById(id).exec();
      }
      if (community && !community.isDeleted) {
        return community
      }

      throw new APIError({
        message: "Community does not exist",
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List community Types in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of community types to be skipped.
   * @param {number} limit - Limit number of community types to be returned.
   * @returns {Promise<Subject[]>}
   */
  async list({ page = 1, perPage = 30, customer }) {
    const options = omitBy({ customer, isDeleted }, isNil);

    let communitys = await this.find(options)
      .populate('community.customer','_id firstName lastName picture')
      .sort({ createdAt: -1 })
      .skip(perPage * (page * 1 - 1))
      .limit(perPage * 1)
      .exec();
    communitys = communitys.map((community) => community.transform());
    var count = await this.find(options).exec();
    count = count.length;
    var pages = Math.ceil(count / perPage);

    return { communitys, count, pages };
  },
};

module.exports = mongoose.model("Community", communitySchema)
