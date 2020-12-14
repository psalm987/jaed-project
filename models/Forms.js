const mongoose = require("mongoose");

const FormsSchema = mongoose.Schema({
  userTypes: {
    type: Array,
  },
  receiverId: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  toAdmin: {
    type: Boolean,
  },
  changeProfile: {
    type: Boolean,
  },
  content: {
    type: Array,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  postLink: {
    type: String,
    default: "/api/requests",
  },
  users: {
    type: Array,
  },
});

module.exports = mongoose.model("Forms", FormsSchema);
