require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Business = require('./models/business');
const Review = require('./models/review');
const Photo = require('./models/photo');

const mongoURI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27018/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  populateDatabase();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

async function populateDatabase() {
  try {
    await Business.deleteMany({});
    await Review.deleteMany({});
    await Photo.deleteMany({});

    const businessesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'businesses.json')));
    await Business.insertMany(businessesData);
    console.log('Businesses inserted successfully.');

    const reviewsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'reviews.json')));
    await Review.insertMany(reviewsData);
    console.log('Reviews inserted successfully.');

    const photosData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'photos.json')));
    await Photo.insertMany(photosData);
    console.log('Photos inserted successfully.');

    console.log('Database population complete.');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error populating database:', err);
    mongoose.connection.close();
  }
}