const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  mongo: {
    uri: process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TESTS : process.env.MONGO_URI,
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  userSessionTimeInMins: process.env.MOBILE_USER_SESSION_TIME_IN_MINS,
  grpcConfig: {
    admin: process.env.GRPC_ADMIN,
    alert: process.env.GRPC_ALERT,
    ip: process.env.GRPC_IP,
    port: process.env.GRPC_PORT,
    monitor: process.env.GRPC_MONITOR,
    inference: process.env.GRPC_INFERANCE,
    data: process.env.GRPC_DATA,
    business: process.env.GRPC_BUSINESS
  },
  s3: {
    accessKey: process.env.VIGO_S3_ACCESSKEY,
    secretKey: process.env.VIGO_GW_S3_SECRETKEY,
    bucketName: process.env.VIGO_GW_S3_BUCKETNAME
  },
};
