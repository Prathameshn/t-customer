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

exports.getCustomerList = async ({ page = 1, perPage = 30, search }) => {
   try {
      let queryArr = []
      if (search && search.length > 0) {
         queryArr.push({ firstName: { $regex: search, $options: 'i' } })
         queryArr.push({ "mobile.number": { $regex: search, $options: 'i' } })
         queryArr.push({ lastName: { $regex: search, $options: 'i' } })
      } else {
         queryArr.push({})
      }
      let customers = await Customer.find({ $or: queryArr }).sort({ createdAt: -1 })
         .skip(perPage * (page * 1 - 1))
         .limit(perPage * 1)
      return customers
   } catch (error) {
      throw error
   }
}

exports.load = async (req, res, next) => {
   try {
      const { entity } = req.session
      const customer = await Customer.get(entity)
      req.locals.customer = customer;
      return next()
   } catch (error) {
      next(error)
   }
}


exports.setCustomerById = async ({id}) => {
   try {
      let customer
      customer = await Customer.findById(id)
      if (customer) {
         return customer.transform()
      }
      else{
         throw {message:"Customer not found"}
      }
   } catch (error) {
      throw error
   }
}