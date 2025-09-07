const express = require('express');
const {
  addLidarData,
  getLidarData,
  getLatestLidarData,
  clearLidarData,
  startLidarScan,
  stopLidarScan
} = require('../controllers/lidarController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/lidar
// @desc    Add LIDAR scan data
// @access  Private
router.post('/', addLidarData);

// @route   GET /api/lidar
// @desc    Get LIDAR data (with pagination)
// @access  Private
router.get('/', getLidarData);

// @route   GET /api/lidar/latest
// @desc    Get latest LIDAR scan
// @access  Private
router.get('/latest', getLatestLidarData);

// @route   DELETE /api/lidar
// @desc    Clear all LIDAR data
// @access  Private
router.delete('/', clearLidarData);

// @route   POST /api/lidar/start
// @desc    Start LIDAR scan
// @access  Private
router.post('/start', startLidarScan);

// @route   POST /api/lidar/stop
// @desc    Stop LIDAR scan
// @access  Private
router.post('/stop', stopLidarScan);

module.exports = router;

