const grpc = require("@grpc/grpc-js");
const { grpcConfig } = require('@config/vars')
const routes = require('./routes')
const server = new grpc.Server();

for (route of routes) {
   server.addService(route.definition, route.methods);
}
server.bindAsync(`${grpcConfig.ip}:${grpcConfig.port}`, grpc.ServerCredentials.createInsecure(), port => {
   console.log(`GRPC running on ${grpcConfig.ip}:${grpcConfig.port}`)
   server.start();
});