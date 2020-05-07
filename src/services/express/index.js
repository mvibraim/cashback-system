import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

let app = (apiRoot, routes) => {
  let app = express();

  app.use(helmet());
  app.use(bodyParser.json());
  app.use(cors());
  app.use(morgan("combined"));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(apiRoot, routes);

  return app;
};

export default app;
