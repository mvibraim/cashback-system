import { MongoClient } from "mongodb";

const HOSTNAME = process.env.MONGODB_HOSTNAME || "localhost";
const DATABASE_NAME = process.env.MONGODB_DATABASE || "cashback-system";
const URI = `mongodb://${HOSTNAME}/${DATABASE_NAME}`;

let database = null;

let startDatabase = async () => {
  const connection = await MongoClient.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  database = connection.db();
};

let databaseConnection = () => database;

export { databaseConnection, startDatabase };
