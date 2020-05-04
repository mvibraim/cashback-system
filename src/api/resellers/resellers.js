import { databaseCursor } from '../../services/mongo'

const collectionName = 'resellers';

async function insertReseller(reseller) {
  reseller.purchases = []
  const db = await databaseCursor();
  const { ops: [inserted_reseller] } = await db.collection(collectionName).insertOne(reseller);
  return inserted_reseller;
}

export { insertReseller }
