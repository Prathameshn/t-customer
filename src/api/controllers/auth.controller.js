const Customer = require('@models/auth/customer.model');

exports.register = async (req, res, next) => {
  try {
    let { mobileDeviceInfo, referralCode, fcmId, mobile, firstName, lastName, password } = req.body //MobileDevice info contains make fcmid and other shit
    mobileDeviceInfo.fcmId = fcmId;
    let _customer = await Customer.getByMobile(mobile)
    if (!_customer) {
      _customer = await Customer.create({ mobileDeviceInfo, fcmId, mobile, firstName, lastName, password })
      const { customer, accessToken } = await Customer.findAndGenerateToken({ mobile: _customer.mobile })
      res.json({
        message: "OK",
        customer,
        accessToken,
        existing: false,
      });
    } else {
      _customer.mobileDeviceInfo = mobileDeviceInfo
      _customer.mobile = mobile
      await _customer.save()
      const { customer, accessToken } = await Customer.findAndGenerateToken({ mobile: _customer.mobile })
      res.json({
        message: "OK",
        customer,
        accessToken,
        existing: true,
      });
    }
  } catch (error) {
    next(error);
  }
};