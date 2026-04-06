const { Trip } = require('../models/index');
const EmergencyContact = require('../models/EmergencyContact');

// @desc  Start a trip
// @route POST /api/trips/start
const startTrip = async (req, res) => {
  try {
    const { destination, startLocation, eta, startCoords } = req.body;

    const trip = await Trip.create({
      user: req.user._id,
      destination,
      startLocation: startLocation || 'Current Location',
      startCoords,
      eta: new Date(eta),
    });

    // Simulated SMS: notify contacts trip started
    const contacts = await EmergencyContact.find({ user: req.user._id });
    await Promise.all(
      contacts.map((c) =>
        EmergencyContact.findByIdAndUpdate(c._id, {
          $push: {
            alertsReceived: {
              message: `✈️ ${req.user.name} started a trip to "${destination}". ETA: ${new Date(eta).toLocaleTimeString()}`,
              type: 'TRIP',
            },
          },
        })
      )
    );

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Mark trip as safe
// @route PUT /api/trips/:id/safe
const markTripSafe = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.status = 'SAFE';
    trip.markedSafeAt = new Date();
    await trip.save();

    // Notify contacts trip ended safely
    const contacts = await EmergencyContact.find({ user: req.user._id });
    await Promise.all(
      contacts.map((c) =>
        EmergencyContact.findByIdAndUpdate(c._id, {
          $push: {
            alertsReceived: {
              message: `✅ ${req.user.name} has safely reached "${trip.destination}"`,
              type: 'SAFE',
            },
          },
        })
      )
    );

    req.app.get('io').emit('trip:safe', { tripId: trip._id, userName: req.user.name });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update trip location
// @route PUT /api/trips/:id/location
const updateTripLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.locationHistory.push({ lat, lng });

    // Check if ETA has passed by 10+ minutes without marking safe
    const overdueTime = new Date(trip.eta.getTime() + 10 * 60 * 1000);
    if (trip.status === 'ONGOING' && new Date() > overdueTime && !trip.autoAlertTriggered) {
      trip.status = 'OVERDUE';
      trip.autoAlertTriggered = true;

      // Auto-alert contacts
      const contacts = await EmergencyContact.find({ user: trip.user });
      await Promise.all(
        contacts.map((c) =>
          EmergencyContact.findByIdAndUpdate(c._id, {
            $push: {
              alertsReceived: {
                message: `⚠️ OVERDUE ALERT: Trip to "${trip.destination}" is overdue. Last location: lat=${lat}, lng=${lng}`,
                type: 'TRIP',
              },
            },
          })
        )
      );

      req.app.get('io').emit('trip:overdue', { tripId: trip._id });
    }

    await trip.save();
    res.json({ message: 'Location updated', status: trip.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get user trips
// @route GET /api/trips
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get active trip
// @route GET /api/trips/active
const getActiveTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ user: req.user._id, status: 'ONGOING' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startTrip, markTripSafe, updateTripLocation, getTrips, getActiveTrip };
