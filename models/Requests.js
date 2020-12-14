const mongoose = require("mongoose");

const RequestsSchema = mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  toAdmin: Boolean,
  changeProfile: Boolean,
  description: {
    type: String,
    required: true,
  },
  content: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Cancelled"],
    required: true,
    default: "Pending",
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Requests", RequestsSchema);
