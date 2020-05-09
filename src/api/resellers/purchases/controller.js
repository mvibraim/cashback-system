import { insertPurchase, getCashback, getPurchases } from "./purchase";
import { map } from "lodash/collection";

let createPurchase = async (req, res, next) => {
  try {
    let insertedPurchase = await insertPurchase(req.body, req.params.cpf);
    res.json(insertedPurchase);
  } catch (err) {
    handleErrors = (err, res, req, next);
  }
};

let indexPurchases = async (req, res, next) => {
  try {
    if (
      typeof req.query.previous !== "undefined" &&
      typeof req.query.next !== "undefined"
    ) {
      res.status(400).json({
        message: `Can't use query params 'next' and 'previous' simultaneously`,
      });
    } else {
      let response = await getPurchases(req);
      res.json(response);
    }
  } catch (err) {
    handleErrors(err, res, req, next);
  }
};

let purchasesCashback = async (req, res, next) => {
  try {
    let amount = await getCashback(req.params.cpf);
    res.json({ amount: amount });
  } catch (err) {
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
