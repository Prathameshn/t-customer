const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { omitBy, isNil } = require('lodash');
const APIError = require('@utils/APIError');
const httpStatus = require('http-status');
const ObjectId = Schema.Types.ObjectId

var feedSchema = new Schema({
    type:{ type: String, enum:["INNOVATION","POST"], default:"POST"},
    mode:{ type: String, enum:["LOCAL","PUBLIC"], default:"LOCAL" },
    likeCount: { type: Number, default:0},
    commentCount: { type: Number, default:0},
    description: { type:String, require:true },
    title: { type: String, require:true},
    productName: { type: String},
    productDescription: { type: String},
    businessName: { type: String},
    contactNumber: { type: String},
    address: { type: String},
    isDeleted:{ type: Boolean, default:false},
    isEdited:{ type: Boolean, default:false},
    media:{
        type:[{ 
            fieldname: String,
            originalname: String,
            encoding: String,
            mimetype: String,
            destination: String,
            filename: String,
            path: String,
            size: Number,
            compressImageUrl:String 
        }],
        default:[]
    },
    customer:{
        type:ObjectId,
        ref:'Customer',
        require:true
    }
},
  { timestamps: true }
)

feedSchema.index({ 'customer': 1})

feedSchema.method({
  transform() {
    const transformed = {};
    const fields = [
        "type",
        "mode",
        "likeCount",
        "commentCount",
        "description",
        "title",
        "productName",
        "productDescription",
        "businessName",
        "contactNumber",
        "address",
        "isDeleted",
        "media",
        "customer",
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

feedSchema.statics = {
  /**
   * Get feed Type
   *
   * @param {ObjectId} id - The objectId of feed Type.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let feed;
      if (mongoose.Types.ObjectId.isValid(id)) {
        feed = await this.findById(id).exec();
      }
      if (feed && !feed.isDeleted) {
        return feed.transform()
      }

      throw new APIError({
        message: "Feed does not exist",
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List feed Types in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of feed types to be skipped.
   * @param {number} limit - Limit number of feed types to be returned.
   * @returns {Promise<Subject[]>}
   */
  async list({ page = 1, perPage = 30, createdBy }) {
    const options = omitBy({ createdBy }, isNil);

    let feeds = await this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page * 1 - 1))
      .limit(perPage * 1)
      .exec();
    feeds = feeds.map((feed) => feed.transform());
    var count = await this.find(options).exec();
    count = count.length;
    var pages = Math.ceil(count / perPage);

    return { feeds, count, pages };
  },
};

module.exports = mongoose.model("Feed", feedSchema)
