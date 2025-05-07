const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userid: { type: Number, required: true },
  businessid: { type: Number, required: true },
  caption: String
});

module.exports = mongoose.model('Photo', photoSchema);