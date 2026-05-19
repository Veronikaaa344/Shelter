import express from 'express';
import UserStats from '../models/UserStats.js';
import User from '../models/User.js';
import DiaryEntry from '../models/DiaryEntry.js';
import ActivityLog from '../models/ActivityLog.js';
import DiagnosticResult from '../models/DiagnosticResult.js';
import auth from '../middleware/auth.js';
import { calculateResilienceChange } from '../utils/resilienceLogic.js';

const router = express.Router();

// Отримати базову статистику користувача (лічильники)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    let userStats = await UserStats.findOne({ userId }).populate('materialsViewed.materials.materialId');
    
    if (!userStats) {
      userStats = new UserStats({ userId });
      await userStats.save();
    }
    
    const statsObj = userStats.toObject();
    if (user && user.stats) {
      statsObj.resilience = user.stats.resilience;
      statsObj.streak = user.stats.streak;
    }
    
    res.json(statsObj);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Записати сесію дихання
router.post('/breathing/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { minutes } = req.body;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) userStats = new UserStats({ userId });
    
    await userStats.recordBreathingSession(minutes);
    
    // Оновлюємо також останню активність у профілі користувача
    await User.findByIdAndUpdate(userId, { 'stats.lastActiveDate': new Date() });
    
    res.json({ success: true, message: 'Breathing session recorded' });
  } catch (error) {
    console.error('Error recording breathing session:', error);
    res.status(500).json({ error: 'Failed to record breathing session' });
  }
});

// Записати результати діагностики
router.post('/diagnostic/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { score, answers } = req.body;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) userStats = new UserStats({ userId });
    
    const isFirstTime = userStats.diagnosticsTaken.count === 0;
    
    await userStats.recordDiagnostic(score, answers);

    // Оновлюємо поточну резильєнтність у профілі
    const user = await User.findById(userId);
    if (user) {
      if (isFirstTime) {
        user.stats.resilience = score;
      } else {
        let resilienceChange = 0;
        if (score >= 60) resilienceChange = 2;
        else if (score <= 40) resilienceChange = -2;
        
        let currentRes = Number(user.stats.resilience);
        if (isNaN(currentRes)) currentRes = 50;
        user.stats.resilience = Math.max(0, Math.min(100, currentRes + resilienceChange));
      }
      user.stats.lastActiveDate = new Date();
      await user.save();
      
      const io = req.app.get('io');
      if (io) {
          io.to(userId).emit('resilienceUpdate', { resilience: user.stats.resilience });
      }
    }
    
    res.json({ success: true, message: 'Diagnostic results recorded' });
  } catch (error) {
    console.error('Error recording diagnostic:', error);
    res.status(500).json({ error: 'Failed to record diagnostic' });
  }
});

// Щоденник: Отримати записи (тепер з окремої колекції)
router.get('/diary/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const entries = await DiaryEntry.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await DiaryEntry.countDocuments({ userId });
    
    res.json({ entries, total });
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    res.status(500).json({ error: 'Failed to fetch diary entries' });
  }
});

// Щоденник: Додати запис
router.post('/diary/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, content, tags = [] } = req.body;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) userStats = new UserStats({ userId });
    
    await userStats.addDiaryEntry(mood, content, tags);
    
    res.json({ success: true, message: 'Diary entry added' });
  } catch (error) {
    console.error('Error adding diary entry:', error);
    res.status(500).json({ error: 'Failed to add diary entry' });
  }
});

// Щоденник: ВИДАЛИТИ запис
router.delete('/diary/:userId/:entryId', auth, async (req, res) => {
  try {
    const { userId, entryId } = req.params;
    
    // Перевіряємо, чи належить запис цьому користувачу
    const entry = await DiaryEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({ error: 'Diary entry not found or unauthorized' });
    }
    
    await DiaryEntry.findByIdAndDelete(entryId);
    
    res.json({ success: true, message: 'Diary entry deleted' });
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    res.status(500).json({ error: 'Failed to delete diary entry' });
  }
});

// Отримати загальну статистику для дашборду (агрегація з різних колекцій)
router.get('/dashboard/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      userStats = new UserStats({ userId });
      await userStats.save();
    }
    
    // Отримуємо останні результати для графіка
    const resilienceHistory = await ActivityLog.find({ userId, type: 'diagnostic' })
      .sort({ createdAt: -1 })
      .limit(7);

    const diaryCount = await DiaryEntry.countDocuments({ userId });
    
    const dashboardData = {
      totalSessions: userStats.totalSessions,
      totalMinutes: userStats.totalMinutes,
      streak: user?.stats?.streak || 0,
      currentResilience: user?.stats?.resilience || 50,
      breathingSessions: userStats.breathingSessions.count,
      diagnosticsTaken: userStats.diagnosticsTaken.count,
      materialsViewed: userStats.materialsViewed.count,
      diaryEntries: diaryCount,
      lastDiagnosticScore: userStats.diagnosticsTaken.lastScore,
      resilienceHistory: resilienceHistory.map(log => ({
        value: log.metadata?.score || 50,
        date: log.createdAt
      })).reverse(),
      recentActivity: {
        lastBreathing: userStats.breathingSessions.lastSession,
        lastDiagnostic: userStats.diagnosticsTaken.lastDate,
        lastDiaryEntry: (await DiaryEntry.findOne({ userId }).sort({ createdAt: -1 }))?.createdAt
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Оновити резильєнтність (тепер через ActivityLog та User модель)
router.post('/resilience/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, name, metadata = {} } = req.body;
    
    // Розрахунок виконується строго на сервері
    const calculatedChange = calculateResilienceChange(type, metadata);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let currentRes = Number(user.stats.resilience);
    if (isNaN(currentRes)) currentRes = 50;
    user.stats.resilience = Math.max(0, Math.min(100, currentRes + calculatedChange));
    user.stats.lastActiveDate = new Date();
    await user.save();
    
    // Створюємо запис в логах
    const newLog = await ActivityLog.create({
      userId,
      type,
      name,
      change: calculatedChange
    });
    
    const io = req.app.get('io');
    if (io) {
        io.to(userId).emit('resilienceUpdate', { resilience: user.stats.resilience });
    }

    res.json({ 
      success: true, 
      currentResilience: user.stats.resilience,
      log: newLog
    });
  } catch (error) {
    console.error('Error updating resilience:', error);
    res.status(500).json({ error: 'Failed to update resilience' });
  }
});

// Записати перегляд матеріалу
router.post('/material-view/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { materialId, minutes } = req.body;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) userStats = new UserStats({ userId });
    
    await userStats.recordMaterialView(materialId, minutes);
    
    // Оновлюємо також останню активність у профілі користувача
    await User.findByIdAndUpdate(userId, { 'stats.lastActiveDate': new Date() });
    
    res.json({ success: true, message: 'Material view recorded' });
  } catch (error) {
    console.error('Error recording material view:', error);
    res.status(500).json({ error: 'Failed to record material view' });
  }
});

export default router;
