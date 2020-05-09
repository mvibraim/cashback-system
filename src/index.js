import http from "http";
import router from "./api";
import expressApp from "./services/express";
import mongoose from "./services/mongoose";
import config from "./config";

let { env, mongo, port, ip, apiRoot } = config;
let app = expressApp(apiRoot, router);
let server = http.createServer(app);

if (mongo.uri) {
  mongoose.connect(mongo.uri);
}

mongoose.Promise = Promise;

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log(
      `Express server listening on http://${ip}:${port}, in ${env} mode`
    );
  });
});
