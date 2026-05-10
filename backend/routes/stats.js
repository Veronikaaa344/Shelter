const express = require('express');
const router = express.Router();
const UserStats = require('../models/UserStats');
const Account = require('../models/Account');
const auth = require('../middleware/auth');

// Получить статистику пользователя
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    let userStats = await UserStats.findOne({ userId }).populate('materialsViewed.materials.materialId');
    
    if (!userStats) {
      // Создаем новую статистику для пользователя
      userStats = new UserStats({ userId });
      await userStats.save();
    }
    
    res.json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Записать сессию дыхания
router.post('/breathing/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { minutes } = req.body;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = new UserStats({ userId });
    }
    
    await userStats.recordBreathingSession(minutes);
    
    res.json({ success: true, message: 'Breathing session recorded' });
  } catch (error) {
    console.error('Error recording breathing session:', error);
    res.status(500).json({ error: 'Failed to record breathing session' });
  }
});

// Записать результаты диагностики
router.post('/diagnostic/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { score, answers } = req.body;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = new UserStats({ userId });
    }
    
    await userStats.recordDiagnostic(score, answers);
    
    res.json({ success: true, message: 'Diagnostic results recorded' });
  } catch (error) {
    console.error('Error recording diagnostic:', error);
    res.status(500).json({ error: 'Failed to record diagnostic' });
  }
});

// Записать просмотр материала
router.post('/material-view/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { materialId, minutes = 0 } = req.body;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = new UserStats({ userId });
    }
    
    await userStats.recordMaterialView(materialId, minutes);
    
    res.json({ success: true, message: 'Material view recorded' });
  } catch (error) {
    console.error('Error recording material view:', error);
    res.status(500).json({ error: 'Failed to record material view' });
  }
});

// Добавить запись в дневник
router.post('/diary/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, content, tags = [] } = req.body;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = new UserStats({ userId });
    }
    
    await userStats.addDiaryEntry(mood, content, tags);
    
    res.json({ success: true, message: 'Diary entry added' });
  } catch (error) {
    console.error('Error adding diary entry:', error);
    res.status(500).json({ error: 'Failed to add diary entry' });
  }
});

// Получить записи из дневника
router.get('/diary/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      return res.json({ entries: [] });
    }
    
    const entries = userStats.diaryEntries
      .sort((a, b) => b.date - a.date)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({ 
      entries,
      total: userStats.diaryEntries.length 
    });
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    res.status(500).json({ error: 'Failed to fetch diary entries' });
  }
});

// Обновить streak (последовательность дней)
router.post('/streak/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = new UserStats({ userId });
    }
    
    await userStats.updateStreak();
    
    res.json({ 
      success: true, 
      streak: userStats.streak,
      message: 'Streak updated' 
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

// Получить общую статистику для дашборда
router.get('/dashboard/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = new UserStats({ userId });
      await userStats.save();
    }
    
    // Формируем данные для дашборда
    const dashboardData = {
      totalSessions: userStats.totalSessions,
      totalMinutes: userStats.totalMinutes,
      streak: userStats.streak,
      currentResilience: userStats.resilience.current,
      breathingSessions: userStats.breathingSessions.count,
      diagnosticsTaken: userStats.diagnosticsTaken.count,
      materialsViewed: userStats.materialsViewed.count,
      diaryEntries: userStats.diaryEntries.length,
      lastDiagnosticScore: userStats.diagnosticsTaken.lastScore,
      resilienceHistory: userStats.resilience.history.slice(-7), // последние 7 записей
      recentActivity: {
        lastBreathing: userStats.breathingSessions.lastSession,
        lastDiagnostic: userStats.diagnosticsTaken.lastDate,
        lastDiaryEntry: userStats.diaryEntries.length > 0 ? 
          userStats.diaryEntries[userStats.diaryEntries.length - 1].date : null
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
