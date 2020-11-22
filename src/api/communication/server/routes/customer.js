const path = require("path");
const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");

const proto = protoLoader.loadSync(path.join(__dirname, "../../proto/", "customer.proto"));
const definition = grpc.loadPackageDefinition(proto);

const customerService = require('@services/customer.service')

const findOrCreate = async (call, callback) => {
   try {
      let { mobile, firstName, lastName } = call.request
      let customer = await customerService.findOrCreate(mobile, firstName, lastName)
      callback(null, customer)
   } catch (error) {
      callback(error, null)
   }
}
const getCustomerList = async (call, callback) => {
   try {
      let CustomerList = await customerService.getCustomerList(call.request)
      callback(null,{Customers:CustomerList})
   } catch (error) {
      callback(error, null)
   }
}

const setCustomerById = async (call, callback) => {
   try {
      let Customer= await customerService.setCustomerById(call.request)
      callback(null,Customer)
   } catch (error) {
      callback(error, null)
   }
}

module.exports = {
   definition: definition.CustomerService.service,
   methods: { findOrCreate, getCustomerList,setCustomerById }
}