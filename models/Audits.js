const mongoose = require("mongoose");

const AuditsSchema = mongoose.Schema({
  societyId: {
    type: String,
    required: true,
  },
  auditorId: {
    type: String,
    required: true,
  },
  auditFilesUrl: {
    type: [String],
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

module.exports = mongoose.model("Audits", AuditsSchema);
