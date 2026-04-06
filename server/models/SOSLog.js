const mongoose = require('mongoose');
const { v4: uuidv4 } = require('crypto');

const sosLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trackingId: {
      type: String,
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase(),
      unique: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'FALSE_ALARM'],
      default: 'ACTIVE',
    },
    triggeredAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    // Array of location snapshots for live tracking
    locationHistory: [
      {
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    // Simulated SMS log
    alertsSent: [
      {
        contactName: String,
        contactPhone: String,
        message: String,
        sentAt: { type: Date, default: Date.now },
        status: { type: String, default: 'DELIVERED' }, // simulated
      },
    ],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SOSLog', sosLogSchema);
