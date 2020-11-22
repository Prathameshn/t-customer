const httpStatus = require('http-status');
const APIError = require('@utils/APIError');
const Customer = require('@models/auth/customer.model')
const { omit } = require('lodash');

exports.loggedIn = async (req, res, next) => {
   try {
      const { entity } = req.session
      const customer = await Customer.get(entity);
      if (customer) {
         return res.status(httpStatus.OK).json(customer)
      } else {
         next(new APIError({
            status: httpStatus.NOT_FOUND,
            isPublic: true,
            message: 'No User logged In'
         }));
      }
   } catch (error) {
      next(new APIError(error))
   }
}

exports.update = async (req, res, next) => {
   try {
      const { entity } = req.session
      let customer = await Customer.get(entity);
      if (customer) {
         let updatedCustomer = omit(req.body, 'role');
         customer = Object.assign(customer, updatedCustomer);
         await customer.save()
         return res.status(httpStatus.OK).json(customer.transform())
      } else {
         next(new APIError({
            status: httpStatus.NOT_FOUND,
            isPublic: true,
            message: 'No User logged In'
         }));
      }
   } catch (error) {
      next(new APIError(error))
   }
}