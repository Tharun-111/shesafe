const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, default: 'Contact' },
    email: { type: String, default: '' },
    // Simulated SMS alerts will be sent to this contact
    alertsReceived: [
      {
        message: String,
        sentAt: { type: Date, default: Date.now },
        type: { type: String, enum: ['SOS', 'TRIP', 'RIDE', 'SAFE'], default: 'SOS' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
