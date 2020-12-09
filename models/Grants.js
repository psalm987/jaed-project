const mongoose = require("mongoose");

const GrantsSchema = mongoose.Schema({
  ownerId: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["valid", "expired", "cancelled"],
    default: "valid",
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
  },
  locations: {
    type: [String],
  },
  societyTypes: {
    type: [String],
  },
});

module.exports = mongoose.model("Grants", GrantsSchema);
