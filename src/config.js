/* eslint-disable no-unused-vars */
import path from "path";
import { merge } from "lodash/object";

let requireProcessEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`You must set the ${name} environment variable`);
  }

  return process.env[name];
};

let config = {
  all: {
    env: process.env.NODE_ENV || "development",
    root: path.join(__dirname, ".."),
    port: process.env.PORT || 9000,
    ip: process.env.IP || "0.0.0.0",
    apiRoot: process.env.API_ROOT || "",
    jwtSecret: requireProcessEnv("JWT_SECRET"),
    cashbackUrl:
      process.env.CASHBACK_URL ||
      "https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback",
    mongo: {
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
      },
    },
  },
  test: {},
  development: {
    mongo: {
      uri: process.env.MONGODB_URI || "mongodb://url/cashback-system",
      options: {
        debug: true,
      },
    },
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || "mongodb://url/cashback-system",
    },
  },
};

let configForEnv = merge(config.all, config[config.all.env]);

export default configForEnv;
