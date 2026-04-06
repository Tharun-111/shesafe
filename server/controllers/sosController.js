const SOSLog = require('../models/SOSLog');
const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');

// Simulate sending SMS — stores alert in DB and marks as "sent"
const simulateSMS = (contactName, contactPhone, message) => ({
  contactName,
  contactPhone,
  message,
  sentAt: new Date(),
  status: 'DELIVERED', // simulated delivery
});

// @desc  Trigger SOS
// @route POST /api/sos/trigger
const triggerSOS = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user._id;

    // Get emergency contacts
    const contacts = await EmergencyContact.find({ user: userId });

    // Build simulated SMS alerts
    const alertsSent = contacts.map((c) =>
      simulateSMS(
        c.name,
        c.phone,
        `🚨 SOS ALERT: ${req.user.name} needs help! Track her at: http://localhost:3000/track/TRACKING_ID | Location: lat=${lat}, lng=${lng}`
      )
    );

    // Create SOS log
    const sos = await SOSLog.create({
      user: userId,
      locationHistory: [{ lat, lng }],
      alertsSent,
    });

    // Fix tracking link in alerts
    sos.alertsSent = sos.alertsSent.map((a) => ({
      ...a,
      message: a.message.replace('TRACKING_ID', sos.trackingId),
    }));
    await sos.save();

    // Mark user as SOS active
    await User.findByIdAndUpdate(userId, {
      sosActive: true,
      lastKnownLocation: { lat, lng, updatedAt: new Date() },
    });

    // Save simulated alerts to each contact's record
    await Promise.all(
      contacts.map((c) =>
        EmergencyContact.findByIdAndUpdate(c._id, {
          $push: {
            alertsReceived: {
              message: `🚨 SOS from ${req.user.name}! Track: http://localhost:3000/track/${sos.trackingId}`,
              type: 'SOS',
            },
          },
        })
      )
    );

    // Emit real-time SOS event via Socket.IO
    req.app.get('io').emit('sos:triggered', {
      userId,
      userName: req.user.name,
      trackingId: sos.trackingId,
      location: { lat, lng },
    });

    res.status(201).json({
      message: 'SOS triggered',
      trackingId: sos.trackingId,
      alertsSent: sos.alertsSent.length,
      sosId: sos._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update SOS location (called every 60s)
// @route PUT /api/sos/:id/location
const updateSOSLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const sos = await SOSLog.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: 'SOS not found' });

    sos.locationHistory.push({ lat, lng });
    await sos.save();

    // Update user's last known location
    await User.findByIdAndUpdate(sos.user, {
      lastKnownLocation: { lat, lng, updatedAt: new Date() },
    });

    // Emit live location update
    req.app.get('io').emit(`sos:location:${sos.trackingId}`, { lat, lng, timestamp: new Date() });

    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Resolve SOS
// @route PUT /api/sos/:id/resolve
const resolveSOSLog = async (req, res) => {
  try {
    const sos = await SOSLog.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: 'SOS not found' });

    sos.status = req.body.status || 'RESOLVED';
    sos.resolvedAt = new Date();
    await sos.save();

    await User.findByIdAndUpdate(sos.user, { sosActive: false });

    req.app.get('io').emit(`sos:resolved:${sos.trackingId}`, { status: sos.status });

    res.json({ message: 'SOS resolved', status: sos.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get SOS by tracking ID (public — for /track/:id page)
// @route GET /api/sos/track/:trackingId
const getSOSByTracking = async (req, res) => {
  try {
    const sos = await SOSLog.findOne({ trackingId: req.params.trackingId }).populate('user', 'name phone');
    if (!sos) return res.status(404).json({ message: 'Tracking ID not found' });
    res.json(sos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get user SOS history
// @route GET /api/sos/history
const getSOSHistory = async (req, res) => {
  try {
    const logs = await SOSLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get active SOS
// @route GET /api/sos/active
const getActiveSOS = async (req, res) => {
  try {
    const sos = await SOSLog.findOne({ user: req.user._id, status: 'ACTIVE' });
    res.json(sos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { triggerSOS, updateSOSLocation, resolveSOSLog, getSOSByTracking, getSOSHistory, getActiveSOS };
