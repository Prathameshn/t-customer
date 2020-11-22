const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const APIError = require('@utils/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('@config/vars');
const Schema = mongoose.Schema
const LoginSession = require("@models/auth/login.session")

/**
* Customer Roles
*/
const roles = ['USER'];
const Genders = ['MALE', 'FEMALE', 'OTHER']
/**
 * Customer Schema
 * @private
 */
const customerSchema = new mongoose.Schema({
  mobile: {
    countryCode: { type: String },
    number: { type: String }
  },
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    trim: true,
    lowercase: true,
  },
  firstName: {
    type: String,
    maxlength: 128,
    trim: true,
  },
  lastName: {
    type: String,
    maxlength: 128,
    trim: true
  },
  gender: { type: String, enum: Genders },
  dob: { type: Date },
  platformPartner: {
    id: { type: Schema.Types.ObjectId, ref: 'PlatformPartner' },
    name: String
  },
  referralCode: {
    type: String,
  },
  mobileDeviceInfo: {
    fcmId: String,
    platformType: String,
    make: String,
    model: String
  },
  role: {
    type: String,
    enum: roles,
    default: 'USER',
  },
  picture: {
    type: String,
    trim: true,
  },
},{ timestamps: true },
{
   toObject: { virtuals: true },
   toJSON: { virtuals: true }
});


customerSchema.set('toObject', { virtuals: true })
customerSchema.set('toJSON', { virtuals: true })
customerSchema.virtual('name').get(function () {
  return this.firstName + " " + this.lastName
})

customerSchema.virtual('age').get(function () {
  const dob = new Date(this.dob)
  var today = new Date()
  var age = today.getFullYear() - dob.getFullYear()
  if (today.getMonth() === dob.getMonth() || today.getDate() === dob.getDate() ||
    today.getMonth() < dob.getMonth() || today.getDate() < dob.getDate()) {
    --age
  }
  return age
})

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
customerSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
customerSchema.method({
 
  transform() {
    const transformed = {};

    const fields = [
      'id',
      'mobile',
      'email',
      'firstName',
      'lastName',
      'gender',
      'dob',
      'businessChannel',
      'referralCode',
      'mobileDeviceInfo',
      'role',
      'age',
      'picture'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  async token(ip) {
    try {
      const payload = {
        entityType: 'USER',
        entity: this,
        ipAddress: ip,
        channel: 'MOBILE'
      };
      const sessionToken = await LoginSession.createSession(payload)
      const token = await jwt.sign(sessionToken, jwtSecret)
      return token
    } catch (error) {
      throw error
    }
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

/**
 * Statics
 */
customerSchema.statics = {

  roles,

  /**
   * Get customer
   *
   * @param {ObjectId} id - The objectId of customer.
   * @returns {Promise<Customer, APIError>}
   */
  async get(id) {
    try {
      let customer;

      if (mongoose.Types.ObjectId.isValid(id)) {
        customer = await this.findById(id).exec();
      }
      if (customer) {
        return customer;
      }

      throw new APIError({
        message: 'Customer does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  async getByMobile(mobile) {
    try {
      let customer;

      if (mobile && mobile.number && mobile.countryCode) {
        customer = await this.findOne({ 'mobile.countryCode': mobile.countryCode, 'mobile.number': mobile.number }).exec();
      }
      if (customer) {
        return customer;
      }

      return null
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find customer by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of customer.
   * @returns {Promise<Customer, APIError>}
   */
  async findAndGenerateToken(options) {
    const { mobile, refreshObject, ip } = options;
    if (!mobile) throw new APIError({ message: 'A mobile number is required to generate a token' });

    const customer = await this.findOne({ 'mobile.countryCode': mobile.countryCode, 'mobile.number': mobile.number }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (mobile) {
      if (customer) {
        const accessToken = await customer.token(ip);
        return { customer: customer.transform(), accessToken };
      }
      err.message = 'Incorrect mobile';
    } else if (refreshObject && refreshObject.customerEmail === email) {
      if (moment(refreshObject.expires).isBefore()) {
        err.message = 'Invalid refresh token.';
      } else {
        return { customer, accessToken: customer.token() };
      }
    } else {
      err.message = 'Incorrect email or refreshToken';
    }
    throw new APIError(err);
  },

  /**
   * List customers in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of customers to be skipped.
   * @param {number} limit - Limit number of customers to be returned.
   * @returns {Promise<Customer[]>}
   */
  list({
    page = 1, perPage = 30, name, email, role,
  }) {
    page = parseInt(page)
    perPage = parseInt(perPage)
    const options = omitBy({ name, email, role }, isNil);
    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'email',
          location: 'body',
          messages: ['"email" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

  async oAuthLogin({
    service, id, email, name, picture,
  }) {
    const customer = await this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] });
    if (customer) {
      customer.services[service] = id;
      if (!customer.name) customer.name = name;
      if (!customer.picture) customer.picture = picture;
      return customer.save();
    }
    const password = uuidv4();
    return this.create({
      services: { [service]: id }, email, password, name, picture,
    });
  },
};

/**
 * @typedef Customer
 */
module.exports = mongoose.model('Customer', customerSchema);
