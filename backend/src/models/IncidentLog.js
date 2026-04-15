const mongoose = require("mongoose");

const incidentLogSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  decibel: {
    type: Number,
    required: true,
  },
  frequency: {
    type: String,
    default: "unknown",
  },
  timestamp: {
    type: Date,
    default: Date.now,
    // Auto-delete documents after 30 days (2592000 seconds) for GDPR compliance
    index: { expires: 2592000 },
  },
  resolution: {
    type: String,
    default: "pending",
  },
  threat: {
    type: Boolean,
    default: false,
  },
  action: {
    type: String,
    default: "",
  },
});

const IncidentLog = mongoose.model("IncidentLog", incidentLogSchema);

module.exports = IncidentLog;
