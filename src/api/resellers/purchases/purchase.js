import { Schema } from "mongoose";
import { Reseller } from "../model";
import fetch from "node-fetch";
import config from "../../../config";
import { head, last, reverse } from "lodash/array";
import mongoose from "mongoose";

const PAGE_SIZE = 5;

let purchaseSchema = new Schema(
  {
    code: {
      type: String,
      match: /^[0-9]*$/,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reseller_cpf: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: Number,
      enum: [0, 1],
      required: true,
    },
    cashback_amount: {
      type: Number,
      required: true,
    },
    cashback_percentage: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
  },
  {
    timestamps: true,
  }
);

/* eslint-disable no-unused-vars */
let insertPurchase = async (purchase, resellerCpf) => {
  let resellerWithCpf = await Reseller.findOne({ cpf: resellerCpf });

  if (!resellerWithCpf) {
    let error = new Error(`Reseller with CPF '${resellerCpf}' not found`);
    error.name = "ResellerWithCPFNotFound";
    throw error;
  } else {
    let newPurchase = preSavePurchase(purchase, resellerCpf);

    let {
      value: {
        purchases: [insertedPurchase, ...tail],
      },
    } = await Reseller.findOneAndUpdate(
      { cpf: resellerCpf },
      {
        $push: {
          purchases: {
            $each: [newPurchase],
            $position: 0,
          },
        },
      },
      { new: true, rawResult: true }
    );

    return purchaseView(insertedPurchase);
  }
};
/* eslint-enable no-unused-vars */

let getCashback = async (cpf) => {
  let headers = { token: "ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm" };

  let cashback_credit = fetch(`${config.cashbackUrl}?cpf=${cpf}`, {
    method: "GET",
    headers: headers,
  })
    .then((data) => data.json())
    .then((response) => response.body.credit);

  return cashback_credit;
};

let getPurchases = async (req) => {
  let cpf = req.params.cpf;
  let resellerWithCpf = await Reseller.findOne({ cpf: cpf });

  if (!resellerWithCpf) {
    let error = new Error(`Reseller with CPF '${cpf}' not found`);
    error.name = "ResellerWithCPFNotFound";
    throw error;
  } else {
    let next = req.query.next;
    let previous = req.query.previous;

    let resellerAggregateCursor = Reseller.aggregate([
      { $match: { cpf: cpf } },
      { $unwind: "$purchases" },
    ]);

    if (typeof next !== "undefined") {
      resellerAggregateCursor.match({
        "purchases._id": { $lte: mongoose.Types.ObjectId(next) },
      });
    }

    if (typeof previous !== "undefined") {
      resellerAggregateCursor
        .match({ "purchases._id": { $gte: mongoose.Types.ObjectId(previous) } })
        .sort({ "purchases._id": 1 });
    }
    let purchases = await resellerAggregateCursor
      .limit(PAGE_SIZE)
      .project({ purchases: 1, _id: 0 })
      .then((resellersList) =>
        resellersList.map((reseller) => reseller.purchases)
      )
      .then((purchases) => {
        if (typeof previous !== "undefined") {
          return reverse(purchases);
        } else {
          return purchases;
        }
      });

    let cursors = await findCursors(purchases, cpf);

    let response = {
      purchases: purchases,
      next: cursors.next,
      previous: cursors.previous,
    };

    return listPurchaseView(response);
  }
};

let findCursors = async (purchases, cpf) => {
  let cursors = {};

  if (purchases.length > 0) {
    let { _id: firstPurchaseIdInPage } = head(purchases);
    let { _id: lastPurchaseIdInPage } = last(purchases);

    let previousCursor = await Reseller.aggregate([
      { $match: { cpf: cpf } },
      { $unwind: "$purchases" },
      {
        $match: {
          "purchases._id": {
            $gt: mongoose.Types.ObjectId(firstPurchaseIdInPage),
          },
        },
      },
      { $sort: { "purchases._id": 1 } },
      { $limit: 1 },
    ]).then((resellersList) => {
      if (resellersList.length == 1) {
        return resellersList[0].purchases._id;
      } else {
        return null;
      }
    });

    let nextCursor = await Reseller.aggregate([
      { $match: { cpf: cpf } },
      { $unwind: "$purchases" },
      {
        $match: {
          "purchases._id": {
            $lt: mongoose.Types.ObjectId(lastPurchaseIdInPage),
          },
        },
      },
      { $limit: 1 },
    ]).then((resellersList) => {
      if (resellersList.length == 1) {
        return resellersList[0].purchases._id;
      } else {
        return null;
      }
    });

    cursors.next = nextCursor;
    cursors.previous = previousCursor;
  } else if (
    purchases.length == 0 &&
    typeof next === "undefined" &&
    typeof previous === "undefined"
  ) {
    cursors.next = null;
    cursors.previous = null;
  }

  return cursors;
};

let preSavePurchase = (purchase, resellerCpf) => {
  purchase.reseller_cpf = resellerCpf.replace(/\D/g, "");
  purchase.status = calculateStatus(purchase.reseller_cpf);
  purchase.cashback_percentage = calculateCashbackPercentage(purchase.amount);
  purchase.cashback_amount = purchase.amount * purchase.cashback_percentage;

  return purchase;
};

let calculateStatus = (resellerCpf) => {
  if (resellerCpf == "15350946056") {
    return 1;
  } else {
    return 0;
  }
};

let calculateCashbackPercentage = (amount) => {
  if (amount <= 100000) {
    return 0.1;
  } else if (amount > 100000 && amount <= 150000) {
    return 0.15;
  } else {
    return 0.2;
  }
};

let purchaseView = (purchase) => {
  let status = "";

  if (purchase.status == 0) {
    status = "Em validação";
  } else {
    status = "Aprovado";
  }

  return {
    id: purchase._id,
    status: status,
    cashback_amount: purchase.cashback_amount,
    cashback_percentage: purchase.cashback_percentage,
    amount: purchase.amount,
    code: purchase.code,
    date: purchase.date,
    reseller_cpf: purchase.reseller_cpf,
  };
};

let listPurchaseView = (data) => {
  return {
    purchases: data.purchases.map((purchase) => purchaseView(purchase)),
    previous: data.previous,
    next: data.next,
  };
};

export { purchaseSchema, insertPurchase, getCashback, getPurchases };
