const express = require('express');
const router = express.Router();
const { getContacts, addContact, deleteContact, getAlertInbox } = require('../controllers/featureControllers');
const { protect } = require('../middleware/auth');

router.get('/', protect, getContacts);
router.post('/', protect, addContact);
router.delete('/:id', protect, deleteContact);
router.get('/inbox', protect, getAlertInbox);

module.exports = router;
