import { databaseConnection } from "../../../services/mongo";
import { ObjectID } from "mongodb";
import { head, last, reverse } from "lodash/array";
import { getReseller } from "../resellers";
import fetch from "node-fetch";

const COLLECTION = "resellers";
const PAGE_SIZE = 5;

const CASHBACK_URL =
  "https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback";

let headers = { token: "ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm" };

let getCashback = async (cpf) => {
  let cashback_credit = fetch(`${CASHBACK_URL}?cpf=${cpf}`, {
    method: "GET",
    headers: headers,
  })
    .then((data) => data.json())
    .then((response) => response.body.credit);

  return cashback_credit;
};

let insertPurchase = async (purchase, resellerCpf) => {
  let resellerWithCpf = await getReseller(resellerCpf);

  if (!resellerWithCpf) {
    let error = new Error(`Reseller with CPF '${resellerCpf}' not found`);
    error.name = "ResellerWithCPFNotFound";
    throw error;
  } else {
    let newPurchase = calculateCashback(purchase);
    newPurchase.status = calculateStatus(resellerCpf);
    newPurchase.reseller_cpf = resellerCpf;
    newPurchase._id = new ObjectID();

    await databaseConnection()
      .collection(COLLECTION)
      .findOneAndUpdate(
        { cpf: resellerCpf },
        {
          $push: {
            purchases: {
              $each: [newPurchase],
              $position: 0,
            },
          },
        }
      );

    return newPurchase;
  }
};

let getPurchases = async (req) => {
  let cpf = req.params.cpf;
  let resellerWithCpf = await getReseller(cpf);

  if (!resellerWithCpf) {
    let error = new Error(`Reseller with CPF '${cpf}' not found`);
    error.name = "ResellerWithCPFNotFound";
    throw error;
  } else {
    let next = req.query.next;
    let previous = req.query.previous;

    let resellerAggregateCursor = await databaseConnection()
      .collection(COLLECTION)
      .aggregate([{ $match: { cpf: cpf } }, { $unwind: "$purchases" }]);

    if (typeof next !== "undefined") {
      resellerAggregateCursor.match({
        "purchases._id": { $lte: ObjectID(next) },
      });
    }

    if (typeof previous !== "undefined") {
      resellerAggregateCursor
        .match({ "purchases._id": { $gte: ObjectID(previous) } })
        .sort({ "purchases._id": 1 });
    }

    let purchases = await resellerAggregateCursor
      .limit(PAGE_SIZE)
      .project({ purchases: 1, _id: 0 })
      .toArray()
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

    return response;
  }
};

let findCursors = async (purchases, cpf) => {
  let cursors = {};

  if (purchases.length > 0) {
    let { _id: firstPurchaseIdInPage } = head(purchases);
    let { _id: lastPurchaseIdInPage } = last(purchases);

    let previousCursor = await databaseConnection()
      .collection(COLLECTION)
      .aggregate([
        { $match: { cpf: cpf } },
        { $unwind: "$purchases" },
        {
          $match: { "purchases._id": { $gt: ObjectID(firstPurchaseIdInPage) } },
        },
        { $sort: { "purchases._id": 1 } },
        { $limit: 1 },
      ])
      .toArray()
      .then((resellersList) => {
        if (resellersList.length == 1) {
          return resellersList[0].purchases._id;
        } else {
          return null;
        }
      });

    let nextCursor = await databaseConnection()
      .collection(COLLECTION)
      .aggregate([
        { $match: { cpf: cpf } },
        { $unwind: "$purchases" },
        {
          $match: { "purchases._id": { $lt: ObjectID(lastPurchaseIdInPage) } },
        },
        { $limit: 1 },
      ])
      .toArray()
      .then((resellersList) => {
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

let calculateStatus = (resellerCpf) => {
  if (resellerCpf == "15350946056") {
    return 1;
  } else {
    return 0;
  }
};

let calculateCashback = (purchase) => {
  let cashbackPercentage = calculateCashbackPercentage(purchase.amount);
  let cashbackAmount = cashbackPercentage * purchase.amount;

  purchase.cashback_percentage = cashbackPercentage;
  purchase.cashback_amount = cashbackAmount;

  return purchase;
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

export { insertPurchase, getPurchases, getCashback };
