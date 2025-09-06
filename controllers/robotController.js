const RobotData = require('../models/RobotData');

// @desc    Add robot sensor data
// @route   POST /api/robot
// @access  Private
const addRobotData = async (req, res) => {
  try {
    const { sensorType, value, unit, location, notes } = req.body;

    // Create new robot data
    const robotData = new RobotData({
      user: req.user._id,
      sensorType,
      value,
      unit: unit || '',
      location: location || '',
      notes: notes || ''
    });

    await robotData.save();

    res.status(201).json({
      success: true,
      message: 'Robot data added successfully',
      data: {
        id: robotData._id,
        sensorType: robotData.sensorType,
        value: robotData.value,
        unit: robotData.unit,
        location: robotData.location,
        notes: robotData.notes,
        createdAt: robotData.createdAt
      }
    });
  } catch (error) {
    console.error('Add robot data error:', error.message);
    
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
      message: 'Server error while adding robot data'
    });
  }
};

// @desc    Get robot sensor data (newest first)
// @route   GET /api/robot
// @access  Private
const getRobotData = async (req, res) => {
  try {
    const { sensorType, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    if (sensorType) {
      query.sensorType = sensorType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get robot data with pagination
    const robotData = await RobotData.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .select('-user');

    // Get total count for pagination
    const totalCount = await RobotData.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      message: 'Robot data retrieved successfully',
      data: {
        robotData,
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
    console.error('Get robot data error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving robot data'
    });
  }
};

module.exports = {
  addRobotData,
  getRobotData
};

