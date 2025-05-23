const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  ownerid: { type: Number, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  phone: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  website: String,
  email: String
});

module.exports = mongoose.model('Business', businessSchema);