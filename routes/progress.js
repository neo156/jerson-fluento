const express = require('express');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');
const router = express.Router();

// All progress routes require authentication
router.use(auth);

// Record workout
router.post('/workout', async (req, res) => {
  try {
    const { workoutId, title, duration, caloriesBurned } = req.body;

    const progress = new Progress({
      userId: req.user._id,
      type: 'workout',
      workoutId,
      workoutTitle: title,
      duration,
      caloriesBurned: caloriesBurned || 50,
      date: new Date(),
    });

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error recording workout:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record habit
router.post('/habit', async (req, res) => {
  try {
    const { habitId, title } = req.body;

    const progress = new Progress({
      userId: req.user._id,
      type: 'habit',
      habitId,
      habitTitle: title,
      date: new Date(),
    });

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error recording habit:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record stretch
router.post('/stretch', async (req, res) => {
  try {
    const { stretchId, title, duration } = req.body;

    const progress = new Progress({
      userId: req.user._id,
      type: 'stretch',
      stretchId,
      stretchTitle: title,
      duration,
      date: new Date(),
    });

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error recording stretch:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add steps
router.post('/steps', async (req, res) => {
  try {
    const { steps } = req.body;

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already a steps entry for today
    let progress = await Progress.findOne({
      userId: req.user._id,
      type: 'steps',
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (progress) {
      // Update existing entry
      progress.steps = (progress.steps || 0) + steps;
      await progress.save();
    } else {
      // Create new entry
      progress = new Progress({
        userId: req.user._id,
        type: 'steps',
        steps,
        date: today,
      });
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    console.error('Error adding steps:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record language activity
router.post('/language-activity', async (req, res) => {
  try {
    const { activityType, title, wordsLearned, lessonsCompleted, minutesStudied } = req.body;

    const progress = new Progress({
      userId: req.user._id,
      type: 'language-activity',
      activityType,
      languageActivityTitle: title,
      wordsLearned: wordsLearned || 0,
      lessonsCompleted: lessonsCompleted || 0,
      minutesStudied: minutesStudied || 0,
      date: new Date(),
    });

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error recording language activity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's progress
    const todayProgress = await Progress.find({
      userId,
      date: { $gte: today },
    });

    // Get all-time progress
    const allTimeProgress = await Progress.find({
      userId,
    });

    // Calculate today's stats from data
    const todayStats = {
      wordsLearned: 0,
      lessonsCompleted: 0,
      minutesStudied: 0,
      activities: [],
    };

    todayProgress.forEach((progress) => {
      if (progress.type === 'language-activity') {
        todayStats.wordsLearned += progress.wordsLearned || 0;
        todayStats.lessonsCompleted += progress.lessonsCompleted || 0;
        todayStats.minutesStudied += progress.minutesStudied || 0;
        if (progress.languageActivityTitle) {
          todayStats.activities.push({
            title: progress.languageActivityTitle,
            type: progress.activityType,
            wordsLearned: progress.wordsLearned || 0,
            lessonsCompleted: progress.lessonsCompleted || 0,
            minutesStudied: progress.minutesStudied || 0,
          });
        }
      }
    });

    // Calculate all-time stats from data
    const allTimeStats = {
      wordsLearned: 0,
      lessonsCompleted: 0,
      minutesStudied: 0,
      totalActivities: 0,
    };

    allTimeProgress.forEach((progress) => {
      if (progress.type === 'language-activity') {
        allTimeStats.wordsLearned += progress.wordsLearned || 0;
        allTimeStats.lessonsCompleted += progress.lessonsCompleted || 0;
        allTimeStats.minutesStudied += progress.minutesStudied || 0;
        allTimeStats.totalActivities += 1;
      }
    });

    // Calculate streak (consecutive days with at least one activity) from data
    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayProgress = await Progress.findOne({
        userId,
        date: { $gte: dayStart, $lte: dayEnd },
      });

      if (dayProgress) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      today: todayStats,
      allTime: allTimeStats,
      streak: { current: streak },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get today's progress
router.get('/today', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const progress = await Progress.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
    }).sort({ createdAt: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Error fetching today progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get progress range
router.get('/range', async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Please provide startDate and endDate' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const progress = await Progress.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress range:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

