const Customer = require('@models/auth/customer.model')

exports.findOrCreate = async (mobile, firstName, lastName) => {
   try {
      const { number, countryCode } = mobile
      let customer
      customer = await Customer.findOne({ 'mobile.number': number, 'mobile.countryCode': countryCode })
      if (customer) {
         return customer
      } else {
         customer = new Customer({ mobile, firstName, lastName })
         const savedCustomer = await customer.save()
         return savedCustomer.transform()
      }
   } catch (error) {
      throw error
   }
}

exports.setCustomer = async (req, res, next) => {
   try {
      const { entity } = req.session
      const customer = await Customer.get(entity)
      req.locals = {
         customer : customer.transform()
      }
      return next()
   } catch (error) {
      next(error)
   }
}