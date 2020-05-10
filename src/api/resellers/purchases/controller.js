import { insertPurchase, getCashback, getPurchases } from "./purchase";
import { map } from "lodash/collection";
import winston from "../../../services/winston";

let createPurchase = async (req, res, next) => {
  winston.info("Creating purchase");

  try {
    let insertedPurchase = await insertPurchase(req.body, req.params.cpf);
    winston.info("Purchase created successfully");
    res.json(insertedPurchase);
  } catch (err) {
    winston.info(
      `Purchase cannot be created due to ${err.name}, with message '${err.message}'`
    );

    handleErrors = (err, res, req, next);
  }
};

let indexPurchases = async (req, res, next) => {
  winston.info("Retrieving purchases");

  try {
    if (
      typeof req.query.previous !== "undefined" &&
      typeof req.query.next !== "undefined"
    ) {
      let message = `Can't use query params 'next' and 'previous' simultaneously`;
      winston.info(`Purchase cannot be created, with message: '${message}'`);
      res.status(400).json({ message: message });
    } else {
      let response = await getPurchases(req);
      winston.info("Purchase retrieved successfully");
      res.json(response);
    }
  } catch (err) {
    winston.info(
      `Purchase cannot be created due to ${err.name}, with message '${err.message}'`
    );

    handleErrors(err, res, req, next);
  }
};

let purchasesCashback = async (req, res, next) => {
  winston.info("Retrieving purchases cashback amount");

  try {
    let amount = await getCashback(req.params.cpf);
    winston.info("Purchases cashback amount retrieved successfully");
    res.json({ amount: amount });
  } catch (err) {
    winston.info(
      `Purchases cashback amount cannot be retrieved due to ${err.name}, with message '${err.message}'`
    );

    next(err);
  }
};

let handleErrors = (err, res, req, next) => {
  if (err.name == "ResellerWithCPFNotFound") {
    res.status(404).json({ message: err.message });
  } else if (err.name === "ValidationError") {
    res.status(400).json({
      validation_errors: map(err.errors, (error) => {
        return {
          path: error.path,
          message: error.message,
        };
      }),
    });
  } else if (
    err.stack.includes("ObjectID") &&
    typeof req.query.previous !== "undefined"
  ) {
    res.status(400).json({ message: `Query param 'previous' is invalid` });
  } else if (
    err.stack.includes("ObjectID") &&
    typeof req.query.next !== "undefined"
  ) {
    res.status(400).json({ message: `Query param 'next' is invalid` });
  } else {
    next(err);
  }
};

export { createPurchase, indexPurchases, purchasesCashback };
