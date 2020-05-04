import { databaseCursor } from '../../services/mongo'
import createError from 'http-errors'

const collectionName = 'resellers';

async function insertReseller(reseller) {
  const db = await databaseCursor();

  reseller.cpf = reseller.cpf.replace(/\D/g, '')
  reseller.purchases = []

  const resellerWithCpf = await db.collection(collectionName).findOne({ cpf: reseller.cpf })

  if (resellerWithCpf) {
    throw createError(422, `Reseller with CPF '${reseller.cpf}' already exists`)
  }
  else {
    const { ops: [inserted_reseller] } = await db.collection(collectionName).insertOne(reseller);
    return inserted_reseller;
  }
}

export { insertReseller }
