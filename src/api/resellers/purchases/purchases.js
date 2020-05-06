import { databaseConnection } from "../../../services/mongo";
import { ObjectID } from "mongodb";
import { head, last, reverse } from "lodash/array";
import { getReseller } from "../resellers";
import fetch from "node-fetch";

const collectionName = "resellers";
const pageSize = 5;
const headers = { token: "ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm" };

const cashbackUrl =
  "https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback?cpf=12312312323";

async function getCashback() {
  let cashback_credit = fetch(cashbackUrl, { method: "GET", headers: headers })
    .then((data) => {
      return data.json();
    })
    .then((response) => {
      return response.body.credit;
    });

  return cashback_credit;
}

async function insertPurchase(purchase, resellerCpf) {
  const resellerWithCpf = await getReseller(resellerCpf);

  if (!resellerWithCpf) {
    const error = new Error(`Reseller with CPF '${resellerCpf}' not found`);
    error.name = "ResellerWithCPFNotFound";
    throw error;
  } else {
    const newPurchase = calculateCashback(purchase);
    newPurchase.status = calculateStatus(resellerCpf);
    newPurchase.reseller_cpf = resellerCpf;
    newPurchase._id = new ObjectID();

    await databaseConnection()
      .collection(collectionName)
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
}

async function getPurchases(req) {
  const cpf = req.params.cpf;
  const resellerWithCpf = await getReseller(cpf);

  if (!resellerWithCpf) {
    const error = new Error(`Reseller with CPF '${cpf}' not found`);
    error.name = "ResellerWithCPFNotFound";
    throw error;
  } else {
    const next = req.query.next;
    const previous = req.query.previous;

    const resellerAggregateCursor = await databaseConnection()
      .collection(collectionName)
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

    const purchases = await resellerAggregateCursor
      .limit(pageSize)
      .project({ purchases: 1, _id: 0 })
      .toArray()
      .then(function (resellersList) {
        let purchases = resellersList.map((reseller) => {
          return reseller.purchases;
        });

        return purchases;
      })
      .then(async function (purchases) {
        if (typeof previous !== "undefined") {
          return reverse(purchases);
        } else {
          return purchases;
        }
      });

    const cursors = await findCursors(purchases, cpf);

    const response = {
      purchases: purchases,
      next: cursors.next,
      previous: cursors.previous,
    };

    return response;
  }
}

async function findCursors(purchases, cpf) {
  const cursors = {};

  if (purchases.length > 0) {
    let { _id: firstPurchaseIdInPage } = head(purchases);
    let { _id: lastPurchaseIdInPage } = last(purchases);

    let previousCursor = await databaseConnection()
      .collection(collectionName)
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
      .then(function (resellersList) {
        if (resellersList.length == 1) {
          return resellersList[0].purchases._id;
        } else {
          return null;
        }
      });

    let nextCursor = await databaseConnection()
      .collection(collectionName)
      .aggregate([
        { $match: { cpf: cpf } },
        { $unwind: "$purchases" },
        {
          $match: { "purchases._id": { $lt: ObjectID(lastPurchaseIdInPage) } },
        },
        { $limit: 1 },
      ])
      .toArray()
      .then(function (resellersList) {
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
}

function calculateStatus(resellerCpf) {
  if (resellerCpf == "15350946056") {
    return 1;
  } else {
    return 0;
  }
}

function calculateCashback(purchase) {
  const cashbackPercentage = calculateCashbackPercentage(purchase.amount);
  const cashbackAmount = cashbackPercentage * purchase.amount;

  purchase.cashback_percentage = cashbackPercentage;
  purchase.cashback_amount = cashbackAmount;

  return purchase;
}

function calculateCashbackPercentage(amount) {
  if (amount <= 100000) {
    return 0.1;
  } else if (amount > 100000 && amount <= 150000) {
    return 0.15;
  } else {
    return 0.2;
  }
}

export { insertPurchase, getPurchases, getCashback };
