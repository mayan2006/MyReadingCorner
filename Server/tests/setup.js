const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let memoryServer;

beforeAll(async () => {
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
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
