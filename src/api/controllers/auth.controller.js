const Customer = require('@models/auth/customer.model');

//TODO CLEAN THIS
exports.register = async (req, res, next) => {
  try {
    let { mobileDeviceInfo, referralCode, fcmId, mobile, firstName, lastName } = req.body //MobileDevice info contains make fcmid and other shit
    mobileDeviceInfo.fcmId = fcmId;
    //TODO Set business Channel
    //TODO handle referral code
    let _customer = await Customer.getByMobile(mobile)
    if (!_customer) {
      _customer = await Customer.create({ mobileDeviceInfo, fcmId, mobile, firstName, lastName })
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