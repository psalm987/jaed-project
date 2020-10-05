const mongoose = require("mongoose");

const LegalAidSchema = mongoose.Schema({
  societyId: {
    type: String,
    required: true,
  },
  legalAidId: {
    type: String,
    required: true,
  },
  legalAidFilesUrl: {
    type: [String],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  comments: {
    type: [String],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "cancelled", "approved", "reviewing"],
    default: "pending",
  },
});

module.exports = mongoose.model("LegalAid", LegalAidSchema);
