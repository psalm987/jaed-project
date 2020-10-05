const mongoose = require("mongoose");

const RequestsSchema = mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Society profile update", "Members update", "Election"],
    required: true,
  },
  content: {
    type: Map,
    of: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    required: true,
    default: "pending",
  },
  comment: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateCommented: {
    type: Date,
  },
});

module.exports = mongoose.model("Requests", RequestsSchema);
