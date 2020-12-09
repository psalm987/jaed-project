const mongoose = require("mongoose");

const CommentsSchema = mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Requests",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  text: {
    type: String,
  },
});

module.exports = mongoose.model("Comments", CommentsSchema);
