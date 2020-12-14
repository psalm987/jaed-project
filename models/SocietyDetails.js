const mongoose = require("mongoose");

const SocietyDetailsSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
  },
  regno: { type: String },
  class: {
    type: String,
  },
  industry: {
    type: String,
    enum: [
      "Consumer",
      "Credit",
      "Agricultural/Farmers",
      "Housing",
      "Fishing",
      "Multipurpose",
      "Producers",
      "Marketing",
      "Worker",
      "Purchasing service",
      "Manufacturing",
      "Insurance",
      "Retail",
      "Others",
    ],
  },
  dateUpdated: {
    type: Date,
    default: Date.now,
  },
  lastElection: {
    type: Date,
    required: true,
  },
  dateApproved: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "banned"],
    default: "pending",
  },
  address: {
    type: String,
  },
  roadStreet: {
    type: String,
  },
  lga: {
    type: String,
  },
  state: {
    type: String,
  },
  lastAudit: Date,
  lastAuditYear: Date,
  auditClass: String,
  paidUpShareCapital: String,
  membersList: [Map],
  byaws: String,
  approved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("SocietyDetails", SocietyDetailsSchema);
