const express = require('express');
const router = express.Router();
const { createAlert, getAlerts, voteAlert, getSafetyScore } = require('../controllers/featureControllers');
const { protect } = require('../middleware/auth');

router.post('/', protect, createAlert);
router.get('/', getAlerts);
router.put('/:id/vote', protect, voteAlert);
router.get('/safety-score', getSafetyScore);

module.exports = router;
