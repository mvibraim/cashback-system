import { check, validationResult } from "express-validator";
import { insertPurchase, getPurchases, getCashback } from "./purchases";

import {
  listPurchaseView,
  purchaseView,
} from "../../../services/views/purchase";

const createPurchase = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ validation_errors: errors.array(), message: "Invalid params" });
    } else {
      const inserted_purchase = await insertPurchase(req.body, req.params.cpf);
      res.json(purchaseView(inserted_purchase));
    }
  } catch (err) {
    if (err.name == "ResellerWithCPFNotFound") {
      res.status(404).json({ message: err.message });
    } else {
      next(err);
    }
  }
};

const indexPurchases = async (req, res, next) => {
  try {
    if (
      typeof req.query.previous !== "undefined" &&
      typeof req.query.next !== "undefined"
    ) {
      res.status(400).json({
        message: `Can't use query params 'next' and 'previous' simultaneously`,
      });
    } else {
      const response = await getPurchases(req);
      res.json(listPurchaseView(response));
    }
  } catch (err) {
    if (err.name == "ResellerWithCPFNotFound") {
      res.status(404).json({ message: err.message });
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
  }
};

const purchasesCashback = async (req, res, next) => {
  try {
    let value = await getCashback();

    console.log(value);

    res.json({ value: value });
  } catch (err) {
    next(err);
  }
};

const validatePurchase = (method) => {
  switch (method) {
    case "create": {
      return [
        check("code")
          .exists()
          .withMessage("code required")
          .notEmpty()
          .withMessage("code required")
          .isString()
          .withMessage("must be string"),
        check("date")
          .exists()
          .withMessage("date required")
          .notEmpty()
          .withMessage("date required")
          .custom((date) => !isNaN(Date.parse(date)))
          .withMessage("must be date with format YYYY/MM/DD or YYYY-MM-DD"),
        check("value")
          .exists()
          .withMessage("value required")
          .notEmpty()
          .withMessage("value required")
          .custom((value) => Number.isInteger(value))
          .withMessage("must be integer"),
      ];
    }
  }
};

export { createPurchase, indexPurchases, validatePurchase, purchasesCashback };
