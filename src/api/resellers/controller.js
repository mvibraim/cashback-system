import { Reseller } from "./model";
import { map } from "lodash/collection";

let createReseller = async (req, res, next) => {
  try {
    let reseller = await Reseller.create(req.body);
    res.json(reseller.view());
  } catch (err) {
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
