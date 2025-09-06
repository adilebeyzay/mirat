const mongoose = require('mongoose');

const robotDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  sensorType: {
    type: String,
    required: [true, 'Sensor type is required'],
    trim: true,
    enum: {
      values: ['temperature', 'humidity', 'pressure', 'motion', 'light', 'sound', 'vibration', 'other'],
      message: 'Sensor type must be one of: temperature, humidity, pressure, motion, light, sound, vibration, other'
    }
  },
  value: {
    type: Number,
    required: [true, 'Sensor value is required'],
    min: [-999999, 'Value cannot be less than -999999'],
    max: [999999, 'Value cannot exceed 999999']
  },
  unit: {
    type: String,
    trim: true,
    default: '',
    maxlength: [20, 'Unit cannot exceed 20 characters']
  },
  location: {
    type: String,
    trim: true,
    default: '',
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    default: '',
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
robotDataSchema.index({ user: 1, createdAt: -1 });
robotDataSchema.index({ sensorType: 1, createdAt: -1 });

module.exports = mongoose.model('RobotData', robotDataSchema);

