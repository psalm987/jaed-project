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
    enum: ["Resource", "E-Learning"],
    default: "Resource",
  },
  userId: {
    type: String,
  },
  details: {
    type: String,
  },
});

module.exports = mongoose.model("File", FileSchema);
