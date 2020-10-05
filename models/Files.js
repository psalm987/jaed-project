const mongoose = require("mongoose");

const FilesSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
});

module.exports = mongoose.model("Files", FilesSchema);
