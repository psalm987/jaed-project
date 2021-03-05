const mongoose = require("mongoose");

const ConsultantDetailsSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedDate: {
    type: Date,
  },
  name: {
    type: String,
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
  phone: {
    type: String,
  },
  contactName: {
    type: String,
  },
  contactPhotoUrl: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  contactPhone: {
    type: String,
  },
  contactDegree: {
    type: String,
  },
  contactUniversity: {
    type: String,
  },
  contactYear: {
    type: String,
  },
  contactDegreeProofUrl: {
    type: String,
  },
});

module.exports = mongoose.model("ConsultantDetails", ConsultantDetailsSchema);
