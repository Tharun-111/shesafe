// routes/rides.js
const express = require('express');
const r1 = express.Router();
const { logRide, getRides } = require('../controllers/featureControllers');
const { protect } = require('../middleware/auth');
r1.post('/', protect, logRide);
r1.get('/', protect, getRides);
module.exports = r1;
