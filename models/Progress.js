const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['workout', 'habit', 'stretch', 'steps', 'language-activity'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  // Workout fields
  workoutId: String,
  workoutTitle: String,
  duration: Number, // in minutes
  caloriesBurned: Number,
  
  // Habit fields
  habitId: String,
  habitTitle: String,
  
  // Stretch fields
  stretchId: String,
  stretchTitle: String,
  
  // Steps field
  steps: Number,
  
  // Language activity fields
  activityType: String,
  languageActivityTitle: String,
  wordsLearned: Number,
  lessonsCompleted: Number,
  minutesStudied: Number,
}, {
  timestamps: true,
});

// Index for efficient queries
progressSchema.index({ userId: 1, date: -1 });
progressSchema.index({ userId: 1, type: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);

