const express = require('express');
const router = express.Router();
const { triggerSOS, updateSOSLocation, resolveSOSLog, getSOSByTracking, getSOSHistory, getActiveSOS } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');

router.post('/trigger', protect, triggerSOS);
router.put('/:id/location', protect, updateSOSLocation);
router.put('/:id/resolve', protect, resolveSOSLog);
router.get('/history', protect, getSOSHistory);
router.get('/active', protect, getActiveSOS);
router.get('/track/:trackingId', getSOSByTracking); // public route for tracking page

module.exports = router;
