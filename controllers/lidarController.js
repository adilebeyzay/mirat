const LidarData = require('../models/LidarData');

// @desc    Add LIDAR scan data
// @route   POST /api/lidar
// @access  Private
const addLidarData = async (req, res) => {
  try {
    const { scanData, mapData, scanProgress, robotPosition } = req.body;

    // Create new LIDAR data
    const lidarData = new LidarData({
      user: req.user._id,
      scanData: scanData || [],
      mapData: mapData || [],
      scanProgress: scanProgress || 0,
      robotPosition: robotPosition || { x: 0, y: 0 },
      isScanning: scanProgress < 100
    });

    await lidarData.save();

    res.status(201).json({
      success: true,
      message: 'LIDAR data added successfully',
      data: {
        id: lidarData._id,
        scanData: lidarData.scanData,
        mapData: lidarData.mapData,
        scanProgress: lidarData.scanProgress,
        robotPosition: lidarData.robotPosition,
        isScanning: lidarData.isScanning,
        createdAt: lidarData.createdAt
      }
    });
  } catch (error) {
    console.error('Add LIDAR data error:', error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding LIDAR data'
    });
  }
};

// @desc    Get LIDAR data (latest scan)
// @route   GET /api/lidar
// @access  Private
const getLidarData = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get latest LIDAR data
    const lidarData = await LidarData.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .select('-user');

    // Get total count for pagination
    const totalCount = await LidarData.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      message: 'LIDAR data retrieved successfully',
      data: {
        lidarData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get LIDAR data error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving LIDAR data'
    });
  }
};

// @desc    Get latest LIDAR scan
// @route   GET /api/lidar/latest
// @access  Private
const getLatestLidarData = async (req, res) => {
  try {
    const latestData = await LidarData.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-user');

    if (!latestData) {
      return res.json({
        success: true,
        message: 'No LIDAR data found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Latest LIDAR data retrieved successfully',
      data: {
        id: latestData._id,
        scanData: latestData.scanData,
        mapData: latestData.mapData,
        scanProgress: latestData.scanProgress,
        robotPosition: latestData.robotPosition,
        isScanning: latestData.isScanning,
        createdAt: latestData.createdAt
      }
    });
  } catch (error) {
    console.error('Get latest LIDAR data error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving latest LIDAR data'
    });
  }
};

// @desc    Clear all LIDAR data
// @route   DELETE /api/lidar
// @access  Private
const clearLidarData = async (req, res) => {
  try {
    await LidarData.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: 'All LIDAR data cleared successfully'
    });
  } catch (error) {
    console.error('Clear LIDAR data error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing LIDAR data'
    });
  }
};

// @desc    Start LIDAR scan
// @route   POST /api/lidar/start
// @access  Private
const startLidarScan = async (req, res) => {
  try {
    const { robotPosition } = req.body;

    // Create new scan session
    const lidarData = new LidarData({
      user: req.user._id,
      scanData: [],
      mapData: [],
      scanProgress: 0,
      robotPosition: robotPosition || { x: 0, y: 0 },
      isScanning: true
    });

    await lidarData.save();

    res.status(201).json({
      success: true,
      message: 'LIDAR scan started successfully',
      data: {
        id: lidarData._id,
        scanProgress: 0,
        isScanning: true,
        robotPosition: lidarData.robotPosition
      }
    });
  } catch (error) {
    console.error('Start LIDAR scan error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while starting LIDAR scan'
    });
  }
};

// @desc    Stop LIDAR scan
// @route   POST /api/lidar/stop
// @access  Private
const stopLidarScan = async (req, res) => {
  try {
    const { scanId } = req.body;

    const lidarData = await LidarData.findOneAndUpdate(
      { _id: scanId, user: req.user._id },
      { 
        isScanning: false,
        scanProgress: 100
      },
      { new: true }
    );

    if (!lidarData) {
      return res.status(404).json({
        success: false,
        message: 'LIDAR scan not found'
      });
    }

    res.json({
      success: true,
      message: 'LIDAR scan stopped successfully',
      data: {
        id: lidarData._id,
        scanProgress: 100,
        isScanning: false
      }
    });
  } catch (error) {
    console.error('Stop LIDAR scan error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while stopping LIDAR scan'
    });
  }
};

module.exports = {
  addLidarData,
  getLidarData,
  getLatestLidarData,
  clearLidarData,
  startLidarScan,
  stopLidarScan
};
