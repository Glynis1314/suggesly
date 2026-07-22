const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MongoDB connection failed: MONGO_URI is missing in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: host=${mongoose.connection.host}, database=${mongoose.connection.name}`);

    // Startup check: list collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    console.log('Collections in database:', collectionNames);
  } catch (error) {
    console.error('MongoDB connection failed:');
    console.error(`Error Name: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    if (error.code !== undefined && error.code !== null) {
      console.error(`Error Code: ${error.code}`);
    }
    console.error('Full Error Object:', error);
    process.exit(1);
  }
}

module.exports = connectDB;

