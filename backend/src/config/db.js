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

    // Startup migration check for User model (split name to firstName + lastName)
    try {
      const User = mongoose.model('User');
      const usersToMigrate = await User.find({
        $or: [
          { firstName: { $exists: false } },
          { firstName: '' }
        ]
      });
      for (const user of usersToMigrate) {
        const rawName = user.get('name') || '';
        if (rawName) {
          const parts = rawName.trim().split(/\s+/);
          user.firstName = parts[0] || '';
          user.lastName = parts.slice(1).join(' ') || ' ';
          await user.save();
          console.log(`[Migration] Migrated User "${rawName}" to firstName="${user.firstName}", lastName="${user.lastName}"`);
        }
      }
    } catch (migErr) {
      console.warn('[Migration Warn] Failed User migration:', migErr.message);
    }

    // Startup migration check for Contact model (split name to firstName + lastName)
    try {
      const Contact = mongoose.model('Contact');
      const contactsToMigrate = await Contact.find({
        $or: [
          { firstName: { $exists: false } },
          { firstName: '' }
        ]
      });
      for (const contact of contactsToMigrate) {
        const rawName = contact.get('name') || '';
        if (rawName) {
          const parts = rawName.trim().split(/\s+/);
          contact.firstName = parts[0] || '';
          contact.lastName = parts.slice(1).join(' ') || ' ';
          await contact.save();
          console.log(`[Migration] Migrated Contact "${rawName}" to firstName="${contact.firstName}", lastName="${contact.lastName}"`);
        }
      }
    } catch (migErr) {
      console.warn('[Migration Warn] Failed Contact migration:', migErr.message);
    }

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
