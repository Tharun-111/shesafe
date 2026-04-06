// routes/trips.js
const express = require('express');
const router = express.Router();
const { startTrip, markTripSafe, updateTripLocation, getTrips, getActiveTrip } = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startTrip);
router.get('/', protect, getTrips);
router.get('/active', protect, getActiveTrip);
router.put('/:id/safe', protect, markTripSafe);
router.put('/:id/location', protect, updateTripLocation);

module.exports = router;
