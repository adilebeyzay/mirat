const mongoose = require('mongoose');

// LIDAR nokta şeması
const lidarPointSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  angle: {
    type: Number,
    required: true,
    min: 0,
    max: 360
  },
  distance: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // 10 metre maksimum mesafe
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
});

// Harita nokta şeması
const mapPointSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    required: true
  }
});

// Robot pozisyon şeması
const robotPositionSchema = new mongoose.Schema({
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  }
});

const lidarDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  scanData: {
    type: [lidarPointSchema],
    default: []
  },
  mapData: {
    type: [mapPointSchema],
    default: []
  },
  scanProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  robotPosition: {
    type: robotPositionSchema,
    default: { x: 0, y: 0 }
  },
  isScanning: {
    type: Boolean,
    default: false
  },
  scanDuration: {
    type: Number, // milisaniye cinsinden
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  averageDistance: {
    type: Number,
    default: 0
  },
  minDistance: {
    type: Number,
    default: 0
  },
  maxDistance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
lidarDataSchema.index({ user: 1, createdAt: -1 });
lidarDataSchema.index({ isScanning: 1, createdAt: -1 });

// Virtual for scan statistics
lidarDataSchema.virtual('scanStats').get(function() {
  if (this.scanData.length === 0) {
    return {
      totalPoints: 0,
      averageDistance: 0,
      minDistance: 0,
      maxDistance: 0
    };
  }

  const distances = this.scanData.map(point => point.distance);
  return {
    totalPoints: this.scanData.length,
    averageDistance: distances.reduce((sum, dist) => sum + dist, 0) / distances.length,
    minDistance: Math.min(...distances),
    maxDistance: Math.max(...distances)
  };
});

// Pre-save middleware to calculate statistics
lidarDataSchema.pre('save', function(next) {
  if (this.scanData.length > 0) {
    const stats = this.scanStats;
    this.totalPoints = stats.totalPoints;
    this.averageDistance = stats.averageDistance;
    this.minDistance = stats.minDistance;
    this.maxDistance = stats.maxDistance;
  }
  next();
});

module.exports = mongoose.model('LidarData', lidarDataSchema);
