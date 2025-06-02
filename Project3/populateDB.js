require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
// const bcrypt = require('bcryptjs'); // bcrypt is not directly used in this script anymore

const Business = require('./models/business');
const Review = require('./models/review');
const Photo = require('./models/photo');
const User = require('./models/user');

const mongoURI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27018/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => { // Added async here
  console.log('Connected to MongoDB for population');
  
  // Attempt to drop the problematic index before populating
  try {
    if (User.collection && typeof User.collection.dropIndex === 'function') {
      await User.collection.dropIndex("id_1");
      console.log('Successfully dropped "id_1" index from users collection (if it existed).');
    } else {
      console.warn('User.collection.dropIndex is not available. Skipping index drop.');
    }
  } catch (err) {
    if (err.code === 27 || err.message.includes('index not found')) { // 27 is code for "IndexNotFound"
      console.log('Index "id_1" not found on users collection, no need to drop.');
    } else {
      console.error('Error dropping "id_1" index from users collection:', err);
      // Decide if you want to proceed or exit if index drop fails for other reasons
    }
  }
  
  await populateDatabase(); // await populateDatabase call
}).catch(err => {
  console.error('MongoDB connection error during population setup:', err);
  // Ensure connection is closed on error if mongoose.connect itself fails early
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    mongoose.connection.close();
  }
});

async function populateDatabase() {
  try {
    await User.deleteMany({});
    console.log('Existing users deleted.');
    await Business.deleteMany({});
    console.log('Existing businesses deleted.');
    await Review.deleteMany({});
    console.log('Existing reviews deleted.');
    await Photo.deleteMany({});
    console.log('Existing photos deleted.');

    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json')));
    for (const userData of usersData) {
      // The pre-save hook in the User model will handle hashing plain text passwords and re-hash existing hashes.
      const user = new User(userData);
      await user.save();
    }
    console.log('Users populated successfully.');

    // TODO: Ensure ownerid in businessesData matches User _id (string) before inserting.
    const businessesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'businesses.json')));
    await Business.insertMany(businessesData);
    console.log('Businesses inserted successfully.');

    // TODO: Ensure userid in reviewsData matches User _id (string).
    const reviewsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'reviews.json')));
    await Review.insertMany(reviewsData);
    console.log('Reviews inserted successfully.');

    // TODO: Ensure userid in photosData matches User _id (string).
    const photosData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'photos.json')));
    await Photo.insertMany(photosData);
    console.log('Photos inserted successfully.');

    console.log('Database population complete.');
  } catch (err) {
    console.error('Error populating database:', err);
  } finally {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed after population attempt.');
    }
  }
}