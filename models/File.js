const mongoose = require("mongoose");

const FileSchema = mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  dateUploaded: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ["Resource", "E-Learning", "Append"],
    default: "Resource",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Requests",
  },
  details: {
    type: String,
  },
});

module.exports = mongoose.model("File", FileSchema);
