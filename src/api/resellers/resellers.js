import { databaseConnection } from "../../services/mongo";

const COLLECTION = "resellers";

let insertReseller = async (reseller) => {
  reseller.cpf = reseller.cpf.replace(/\D/g, "");

  let resellerWithCpf = await getReseller(reseller.cpf);

  if (resellerWithCpf) {
    let error = new Error(`Reseller with CPF '${reseller.cpf}' already exists`);
    error.name = "ResellerWithCPFAlreadyExists";
    throw error;
  } else {
    reseller.purchases = [];

    let {
      ops: [insertedReseller],
    } = await databaseConnection().collection(COLLECTION).insertOne(reseller);

    return insertedReseller;
  }
};

let getReseller = async (cpf) =>
  await databaseConnection().collection(COLLECTION).findOne({ cpf: cpf });

export { insertReseller, getReseller };
