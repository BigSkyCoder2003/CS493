const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userid: { type: Number, required: true },
  businessid: { type: Number, required: true },
  dollars: { type: Number, required: true, min: 1, max: 4 },
  stars: { type: Number, required: true, min: 0, max: 5 },
  review: String
});

module.exports = mongoose.model('Review', reviewSchema);