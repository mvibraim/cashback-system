import { databaseCursor } from "../../../services/mongo";
import { ObjectID } from "mongodb";
import { head, last, reverse } from "lodash/array";
import { getReseller } from "../resellers";
import fetch from "node-fetch";

const collectionName = "resellers";
const page_size = 5;
const headers = { token: "ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm" };

const cashback_url =
  "https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback?cpf=12312312323";

async function getCashback() {
  let cashback_credit = fetch(cashback_url, { method: "GET", headers: headers })
    .then((data) => {
      return data.json();
    })
    .then((response) => {
      return response.body.credit;
    });

  return cashback_credit;
}

async function insertPurchase(purchase, reseller_cpf) {
  const resellerWithCpf = await getReseller(reseller_cpf);

  if (!resellerWithCpf) {
    const error = new Error(`Reseller with CPF '${reseller_cpf}' not found`);
    error.name = "ResellerWithCPFNotFound";
    throw error;
  } else {
    const db = await databaseCursor();

    const new_purchase = calculate_cashback(purchase);
    new_purchase.status = calculate_status(reseller_cpf);
    new_purchase.reseller_cpf = reseller_cpf;
    new_purchase._id = new ObjectID();

    await db.collection(collectionName).findOneAndUpdate(
      { cpf: reseller_cpf },
      {
        $push: {
          purchases: {
            $each: [new_purchase],
            $position: 0,
          },
        },
      }
    );

    return new_purchase;
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
    const db = await databaseCursor();
    const next = req.query.next;
    const previous = req.query.previous;

    const resellerAggregateCursor = await db
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
      .limit(page_size)
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
  const db = await databaseCursor();
  const cursors = {};

  if (purchases.length > 0) {
    let { _id: firstPurchaseIdInPage } = head(purchases);
    let { _id: lastPurchaseIdInPage } = last(purchases);

    let previousCursor = await db
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

    let nextCursor = await db
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

function calculate_status(reseller_cpf) {
  if (reseller_cpf == "15350946056") {
    return 1;
  } else {
    return 0;
  }
}

function calculate_cashback(purchase) {
  const cashback_percentage = calculate_cashback_percentage(purchase.value);

  const cashback_value = calculate_cashback_value(
    cashback_percentage,
    purchase.value
  );

  purchase.cashback_percentage = cashback_percentage;
  purchase.cashback_value = cashback_value;

  return purchase;
}

function calculate_cashback_percentage(value) {
  if (value <= 100000) {
    return 0.1;
  } else if (value > 100000 && value <= 150000) {
    return 0.15;
  } else {
    return 0.2;
  }
}

function calculate_cashback_value(cashback_percentage, value) {
  return cashback_percentage * value;
}

export { insertPurchase, getPurchases, getCashback };
