const express = require('express');
const { addRobotData, getRobotData } = require('../controllers/robotController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/robot
// @desc    Add robot sensor data
// @access  Private
router.post('/', addRobotData);

// @route   GET /api/robot
// @desc    Get robot sensor data (newest first)
// @access  Private
router.get('/', getRobotData);

module.exports = router;

