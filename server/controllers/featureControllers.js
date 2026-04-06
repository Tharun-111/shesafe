const { Alert, Ride, BuddyMatch, Message } = require('../models/index');
const EmergencyContact = require('../models/EmergencyContact');

// ══════════════════════════════════════════════════
// RIDE CONTROLLER
// ══════════════════════════════════════════════════

const logRide = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType, driverName, fromLocation, toLocation, coords } = req.body;

    const ride = await Ride.create({
      user: req.user._id,
      vehicleNumber,
      vehicleType,
      driverName,
      fromLocation,
      toLocation,
      coords,
    });

    // Simulate sharing with contacts
    const contacts = await EmergencyContact.find({ user: req.user._id });
    const sharedWith = contacts.map((c) => ({ name: c.name, phone: c.phone }));
    ride.sharedWith = sharedWith;
    await ride.save();

    await Promise.all(
      contacts.map((c) =>
        EmergencyContact.findByIdAndUpdate(c._id, {
          $push: {
            alertsReceived: {
              message: `🚕 ${req.user.name} is in a ${vehicleType} (${vehicleNumber}, Driver: ${driverName}) from ${fromLocation} to ${toLocation}`,
              type: 'RIDE',
            },
          },
        })
      )
    );

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════
// COMMUNITY ALERT CONTROLLER
// ══════════════════════════════════════════════════

const createAlert = async (req, res) => {
  try {
    const { type, description, location, coords, severity } = req.body;
    const alert = await Alert.create({
      reportedBy: req.user._id,
      reporterName: req.body.anonymous ? 'Anonymous' : req.user.name,
      type,
      description,
      location,
      coords,
      severity: severity || 'MEDIUM',
    });

    // Broadcast new alert to all connected clients
    req.app.get('io').emit('alert:new', alert);

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ active: true }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const voteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    // Prevent double voting
    if (alert.voters.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already voted' });
    }

    alert.votes += 1;
    alert.voters.push(req.user._id);
    // Auto-upgrade severity based on votes
    if (alert.votes >= 10) alert.severity = 'HIGH';
    else if (alert.votes >= 5) alert.severity = 'MEDIUM';

    await alert.save();
    req.app.get('io').emit('alert:voted', { alertId: alert._id, votes: alert.votes });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Safety score based on nearby alerts
const getSafetyScore = async (req, res) => {
  try {
    const { lat, lng, radius = 0.01 } = req.query; // ~1km radius in degrees
    const alerts = await Alert.find({
      active: true,
      'coords.lat': { $gte: parseFloat(lat) - radius, $lte: parseFloat(lat) + radius },
      'coords.lng': { $gte: parseFloat(lng) - radius, $lte: parseFloat(lng) + radius },
    });

    // Score: 100 = safest, 0 = most dangerous
    const dangerScore = alerts.reduce((acc, a) => {
      const weight = a.severity === 'HIGH' ? 20 : a.severity === 'MEDIUM' ? 10 : 5;
      return acc + weight;
    }, 0);

    const safetyScore = Math.max(0, 100 - dangerScore);
    res.json({ safetyScore, nearbyAlerts: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════
// BUDDY MATCH CONTROLLER
// ══════════════════════════════════════════════════

const createBuddyRequest = async (req, res) => {
  try {
    const { fromLocation, toLocation, travelTime, travelDate } = req.body;

    // Look for an open match with similar route + time
    const existing = await BuddyMatch.find({
      status: 'OPEN',
      travelDate,
      user1: { $ne: req.user._id },
    });

    let matched = null;
    for (const req2 of existing) {
      // Simple similarity: check if routes overlap
      const fromSimilar =
        fromLocation.toLowerCase().includes(req2.fromLocation.toLowerCase().split(' ')[0]) ||
        req2.fromLocation.toLowerCase().includes(fromLocation.toLowerCase().split(' ')[0]);
      const toSimilar =
        toLocation.toLowerCase().includes(req2.toLocation.toLowerCase().split(' ')[0]) ||
        req2.toLocation.toLowerCase().includes(toLocation.toLowerCase().split(' ')[0]);

      if (fromSimilar || toSimilar) {
        matched = req2;
        break;
      }
    }

    if (matched) {
      // Auto-match!
      const chatRoomId = `chat_${matched._id}`;
      matched.user2 = req.user._id;
      matched.status = 'MATCHED';
      matched.matchedAt = new Date();
      matched.chatRoomId = chatRoomId;
      await matched.save();

      req.app.get('io').emit('buddy:matched', {
        matchId: matched._id,
        user1: matched.user1,
        user2: req.user._id,
        chatRoomId,
      });

      return res.status(200).json({ message: 'Matched!', match: matched, chatRoomId });
    }

    // No match yet — create open request
    const request = await BuddyMatch.create({
      user1: req.user._id,
      fromLocation,
      toLocation,
      travelTime,
      travelDate,
    });

    res.status(201).json({ message: 'Request posted. Waiting for a buddy!', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBuddyRequests = async (req, res) => {
  try {
    const requests = await BuddyMatch.find({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
    })
      .populate('user1', 'name phone')
      .populate('user2', 'name phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOpenBuddyRequests = async (req, res) => {
  try {
    const requests = await BuddyMatch.find({ status: 'OPEN', user1: { $ne: req.user._id } })
      .populate('user1', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════
// MESSAGE CONTROLLER
// ══════════════════════════════════════════════════

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatRoomId: req.params.roomId }).sort({ sentAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════
// EMERGENCY CONTACT CONTROLLER
// ══════════════════════════════════════════════════

const getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user._id });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.create({ user: req.user._id, ...req.body });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    await EmergencyContact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAlertInbox = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user._id });
    // Flatten all alerts from all contacts
    const inbox = contacts
      .flatMap((c) =>
        c.alertsReceived.map((a) => ({ ...a.toObject(), contactName: c.name, contactPhone: c.phone }))
      )
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    res.json(inbox);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  logRide, getRides,
  createAlert, getAlerts, voteAlert, getSafetyScore,
  createBuddyRequest, getBuddyRequests, getOpenBuddyRequests,
  getMessages,
  getContacts, addContact, deleteContact, getAlertInbox,
};
