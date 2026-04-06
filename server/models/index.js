const mongoose = require('mongoose');

// ─── Trip Model ───────────────────────────────────────────────
const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true },
    startLocation: { type: String, default: 'Current Location' },
    startCoords: { lat: Number, lng: Number },
    eta: { type: Date, required: true }, // expected arrival time
    status: {
      type: String,
      enum: ['ONGOING', 'SAFE', 'OVERDUE', 'CANCELLED'],
      default: 'ONGOING',
    },
    startedAt: { type: Date, default: Date.now },
    markedSafeAt: { type: Date, default: null },
    // Auto-alert triggered if not marked safe after ETA + 10 min
    autoAlertTriggered: { type: Boolean, default: false },
    locationHistory: [
      {
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ─── Ride Model ───────────────────────────────────────────────
const rideSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNumber: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ['Auto', 'Cab', 'Bus', 'Bike', 'Other'],
      default: 'Cab',
    },
    driverName: { type: String, default: 'Unknown' },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    coords: { lat: Number, lng: Number },
    loggedAt: { type: Date, default: Date.now },
    // Shared with emergency contacts (simulated)
    sharedWith: [{ name: String, phone: String }],
  },
  { timestamps: true }
);

// ─── Community Alert Model ────────────────────────────────────
const alertSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporterName: { type: String, default: 'Anonymous' },
    type: {
      type: String,
      enum: ['UNSAFE_AREA', 'HARASSMENT', 'POOR_LIGHTING', 'SUSPICIOUS', 'ASSAULT', 'OTHER'],
      required: true,
    },
    description: { type: String, required: true },
    location: { type: String, default: '' },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    votes: { type: Number, default: 1 }, // upvotes from community
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Auto-expire after 48 hours
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
    active: { type: Boolean, default: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  },
  { timestamps: true }
);

// TTL index: auto-remove expired alerts
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─── BuddyMatch Model ─────────────────────────────────────────
const buddyMatchSchema = new mongoose.Schema(
  {
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Request details
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    travelTime: { type: String, required: true }, // e.g. "08:00 PM"
    travelDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'MATCHED', 'CANCELLED', 'COMPLETED'],
      default: 'OPEN',
    },
    matchedAt: { type: Date, default: null },
    chatRoomId: { type: String, default: '' },
  },
  { timestamps: true }
);

// ─── Message Model (for buddy chat) ──────────────────────────
const messageSchema = new mongoose.Schema(
  {
    chatRoomId: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = {
  Trip: mongoose.model('Trip', tripSchema),
  Ride: mongoose.model('Ride', rideSchema),
  Alert: mongoose.model('Alert', alertSchema),
  BuddyMatch: mongoose.model('BuddyMatch', buddyMatchSchema),
  Message: mongoose.model('Message', messageSchema),
};
