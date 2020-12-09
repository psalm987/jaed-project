const mongoose = require("mongoose");

const AuditorDetailsSchema = mongoose.Schema({
  userId: {
    type: String,
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
  cardNo: {
    type: String,
  },
  accreditationDate: {
    type: Date,
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
  contactMembershipNo: {
    type: String,
  },
  contactMembershipCardUrl: {
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
  auditExperience: {
    type: [Map],
  },
  cardUrl: {
    type: String,
  },
  constitutionalCertificateUrl: {
    type: String,
  },
  affidavitUrl: {
    type: String,
  },
});

module.exports = mongoose.model("AuditorDetails", AuditorDetailsSchema);
