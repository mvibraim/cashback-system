import { Reseller } from "./model";
import { map } from "lodash/collection";
import winston from "../../services/winston";

let createReseller = async (req, res, next) => {
  winston.info("Creating reseller");

  try {
    let reseller = await Reseller.create(req.body);
    winston.info("Reseller created successfully");
    res.json(reseller.view());
  } catch (err) {
    winston.info(
      `Reseller cannot be created due to ${err.name}, with message: '${err.message}'`
    );

    handleErrors(err, res, next);
  }
};

let handleErrors = (err, res, next) => {
  if (err.name === "MongoError" && err.code === 11000) {
    res.status(409).json({
      path: "cpf",
      message: "CPF already registered",
    });
  } else if (err.name === "ValidationError") {
    res.status(400).json({
      validation_errors: map(err.errors, (error) => {
        return {
          path: error.path,
          message: error.message,
        };
      }),
    });
  } else {
    next(err);
  }
};

export { createReseller };
