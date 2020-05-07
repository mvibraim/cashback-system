import http from "http";
import router from "./api";
import expressApp from "./services/express";
import { startDatabase } from "./services/mongo";

let app = expressApp("", router);
let server = http.createServer(app);
let port = process.env.PORT || 3001;
let ip = "0.0.0.0";

setImmediate(() => {
  startDatabase();

  server.listen(port, ip, () => {
    console.log(`Express server listening on http://${ip}:${port}`);
  });
});
