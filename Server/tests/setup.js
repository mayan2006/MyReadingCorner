const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let memoryServer;

beforeAll(async () => {
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  await Promise.all(
    mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes())
  );
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
});
