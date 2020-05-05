import { databaseCursor } from "../../services/mongo";

const collectionName = "resellers";

async function insertReseller(reseller) {
  reseller.cpf = reseller.cpf.replace(/\D/g, "");

  const resellerWithCpf = getReseller(reseller.cpf);

  if (resellerWithCpf) {
    const error = new Error(
      `Reseller with CPF '${reseller.cpf}' already exists`
    );

    error.name = "ResellerWithCPFAlreadyExists";
    throw error;
  } else {
    const db = await databaseCursor();

    reseller.purchases = [];

    const {
      ops: [insertedReseller],
    } = await db.collection(collectionName).insertOne(reseller);

    return insertedReseller;
  }
}

async function getReseller(cpf) {
  const db = await databaseCursor();
  return await db.collection(collectionName).findOne({ cpf: cpf });
}

export { insertReseller, getReseller };
