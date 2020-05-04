import { databaseCursor } from '../../services/mongo'
import createError from 'http-errors'

const collectionName = 'resellers';

async function insertReseller(reseller) {
  reseller.cpf = reseller.cpf.replace(/\D/g, '')

  const resellerWithCpf = getReseller(reseller.cpf)

  if (resellerWithCpf) {
    throw createError(422, `Reseller with CPF '${reseller.cpf}' already exists`)
  }
  else {
    const db = await databaseCursor();

    reseller.purchases = []

    const { ops: [insertedReseller] } = await db.collection(collectionName).insertOne(reseller);

    return insertedReseller;
  }
}

async function getReseller(cpf) {
  const db = await databaseCursor();
  return await db.collection(collectionName).findOne({ cpf: cpf })
}

export { insertReseller, getReseller }
