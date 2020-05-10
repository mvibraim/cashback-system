import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import winston from "../winston";

/* eslint-disable no-unused-vars */
let jsonErrorHandler = async (err, req, res, next) => {
  winston.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  res.status(err.status).send({ error: err });
};
/* eslint-enable no-unused-vars */

let app = (apiRoot, routes) => {
  let app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan("combined", { stream: winston.stream }));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(jsonErrorHandler);
  app.use(apiRoot, routes);

  return app;
};

export default app;
