// server/tests/setup.js
const mongoose = require('mongoose');
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  // Connect to test database
  const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ai-freelance-test';
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});