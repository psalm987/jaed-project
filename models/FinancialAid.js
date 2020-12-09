const mongoose = require("mongoose");

const FinancialAidSchema = mongoose.Schema({
  societyId: {
    type: String,
    required: true,
  },
  grantId: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  approvedAmount: {
    type: String,
  },
  dateApproved: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "cancelled", "expired"],
    default: "pending",
  },
  message: {
    type: String,
  },
});

module.exports = mongoose.model("FinancialAid", FinancialAidSchema);
