const mongoose = require("mongoose");

const NotificationsSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["success", "warning", "info", "error"],
    default: "success",
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  link: {
    type: String,
  },
  linkText: {
    type: String,
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Notifications", NotificationsSchema);
