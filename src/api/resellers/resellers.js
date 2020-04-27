const { databaseCursor } = require('../../services/mongo');

const collectionName = 'resellers';

async function insertReseller(reseller) {
  const database = await databaseCursor();
  const { insertedId } = await database.collection(collectionName).insertOne(reseller);
  return insertedId;
}

async function getResellers() {
  const database = await databaseCursor();
  return await database.collection(collectionName).find({}).toArray();
}

module.exports = {
  insertReseller,
  getResellers
}
