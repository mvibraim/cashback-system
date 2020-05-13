import { EventEmitter } from "events";
import MongodbMemoryServer from "mongodb-memory-server";
import mongoose from "../src/services/mongoose";

EventEmitter.defaultMaxListeners = Infinity;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

let mongoServer;

beforeAll(async () => {
  mongoServer = new MongodbMemoryServer();
  let mongoUri = await mongoServer.getUri();

  await mongoose.connect(mongoUri, (err) => {
    if (err) {
      console.error(err);
    }
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  let { collections } = mongoose.connection;
  let promises = [];

  Object.keys(collections).forEach((collection) => {
    promises.push(collections[collection].deleteMany({}));
  });

  await Promise.all(promises);
});
