import { databaseConnection } from "../../services/mongo";
import bcrypt from "bcryptjs";

const COLLECTION = "resellers";

let insertReseller = async (reseller) => {
  reseller.cpf = reseller.cpf.replace(/\D/g, "");

  let resellerWithCpf = await getReseller(reseller.cpf);

  if (resellerWithCpf) {
    let error = new Error(`Reseller with CPF '${reseller.cpf}' already exists`);
    error.name = "ResellerWithCPFAlreadyExists";
    throw error;
  } else {
    let salt = await bcrypt.genSalt();

    reseller.purchases = [];
    reseller.password = await bcrypt.hash(reseller.password, salt);

    let {
      ops: [insertedReseller],
    } = await databaseConnection().collection(COLLECTION).insertOne(reseller);

    return insertedReseller;
  }
};

let getReseller = async (cpf) =>
  await databaseConnection().collection(COLLECTION).findOne({ cpf: cpf });

export { insertReseller, getReseller };
