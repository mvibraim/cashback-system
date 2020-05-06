import { databaseConnection } from "../../services/mongo";

const collectionName = "resellers";

async function insertReseller(reseller) {
  reseller.cpf = reseller.cpf.replace(/\D/g, "");

  const resellerWithCpf = await getReseller(reseller.cpf);

  if (resellerWithCpf) {
    const error = new Error(
      `Reseller with CPF '${reseller.cpf}' already exists`
    );

    error.name = "ResellerWithCPFAlreadyExists";
    throw error;
  } else {
    reseller.purchases = [];

    const {
      ops: [insertedReseller],
    } = await databaseConnection()
      .collection(collectionName)
      .insertOne(reseller);

    return insertedReseller;
  }
}

async function getReseller(cpf) {
  let reseller = await databaseConnection()
    .collection(collectionName)
    .findOne({ cpf: cpf });

  return reseller;
}

export { insertReseller, getReseller };
