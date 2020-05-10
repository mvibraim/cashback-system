import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

let jsonErrorHandler = async (err, req, res, next) => {
  res.status(err.status).send({ error: err });
};

let app = (apiRoot, routes) => {
  let app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan("combined"));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(jsonErrorHandler);
  app.use(apiRoot, routes);

  return app;
};

export default app;
