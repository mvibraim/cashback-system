import { MongoClient } from "mongodb";

const hostname = process.env.MONGODB_HOSTNAME || "localhost";
const database_name = process.env.MONGODB_DATABASE || "cashback-system";

const url = "mongodb://" + hostname + "/" + database_name;
let database = null;

async function startDatabase() {
  const connection = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  database = connection.db();
}

async function databaseCursor() {
  if (!database) {
    await startDatabase();
  }

  return database;
}

export { databaseCursor, startDatabase };
