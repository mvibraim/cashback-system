const { databaseCursor } = require('../../services/mongo');

const collectionName = 'ads';

async function insertAd(ad) {
  const database = await databaseCursor();
  const { insertedId } = await database.collection(collectionName).insertOne(ad);
  return insertedId;
}

async function getAds() {
  const database = await databaseCursor();
  return await database.collection(collectionName).find({}).toArray();
}

module.exports = {
  insertAd,
  getAds
}