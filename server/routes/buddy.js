const express = require('express');
const router = express.Router();
const { createBuddyRequest, getBuddyRequests, getOpenBuddyRequests } = require('../controllers/featureControllers');
const { protect } = require('../middleware/auth');

router.post('/request', protect, createBuddyRequest);
router.get('/my', protect, getBuddyRequests);
router.get('/open', protect, getOpenBuddyRequests);

module.exports = router;
