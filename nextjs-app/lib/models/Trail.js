const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  name: String
});

const dayRouteSchema = new mongoose.Schema({
  day: Number,
  waypoints: [waypointSchema],
  distanceKm: Number,
  description: String
});

const trailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userFullName: String,
  location: {
    type: String,
    required: true
  },
  trailType: {
    type: String,
    enum: ['bike', 'trek'],
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  days: [dayRouteSchema],
  totalDistanceKm: Number,
  generatedDescription: String,
  imageUrl: String,
  approvedByUser: {
    type: Boolean,
    default: false
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.models.Trail || mongoose.model('Trail', trailSchema);
