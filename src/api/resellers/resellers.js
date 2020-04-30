const { databaseCursor } = require('../../services/mongo');
const MongoPaging = require('mongo-cursor-pagination');

const collectionName = 'resellers';
const page_size = 10;

async function insertReseller(reseller) {
  const db = await databaseCursor();
  const { ops: [inserted_reseller] } = await db.collection(collectionName).insertOne(reseller);
  return inserted_reseller;
}

async function getResellers(req) {
  const db = await databaseCursor();
  return await MongoPaging.findWithReq(req, db.collection(collectionName), { limit: page_size })
}

module.exports = {
  insertReseller,
  getResellers
}