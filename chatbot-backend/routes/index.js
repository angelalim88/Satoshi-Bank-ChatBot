const express = require('express');
const router = express.Router();

router.use('/chatS', require('./chatSessionRoutes'));
router.use('/chatM', require('./chatMessageRoutes'));

module.exports = router;