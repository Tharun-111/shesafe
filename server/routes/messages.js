const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/featureControllers');
const { protect } = require('../middleware/auth');

router.get('/:roomId', protect, getMessages);

module.exports = router;
