import { databaseCursor } from '../../services/mongo'

const collectionName = 'resellers';

async function insertReseller(reseller) {
  const db = await databaseCursor();

  reseller.cpf = reseller.cpf.replace(/\D/g, '')
  reseller.purchases = []

  const { ops: [inserted_reseller] } = await db.collection(collectionName).insertOne(reseller);

  return inserted_reseller;
}

export { insertReseller }
