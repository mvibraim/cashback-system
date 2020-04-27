const { insertAd, getAds } = require('./service')

const create = async (req, res) => {
  const newAd = req.body;
  await insertAd(newAd);
  res.send({ message: 'New ad inserted.' });
}

const index = async (req, res) => {
  res.send(await getAds());
}

module.exports = {
  create,
  index,
};