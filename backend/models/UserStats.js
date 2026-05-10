const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'Account'
  },
  
  // Статистика использования
  breathingSessions: {
    count: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    lastSession: { type: Date }
  },
  
  diagnosticsTaken: {
    count: { type: Number, default: 0 },
    lastScore: { type: Number },
    lastDate: { type: Date },
    history: [{
      score: Number,
      date: { type: Date, default: Date.now },
      answers: [Number]
    }]
  },
  
  materialsViewed: {
    count: { type: Number, default: 0 },
    materials: [{
      materialId: { type: String, ref: 'Material' },
      viewCount: { type: Number, default: 0 },
      lastViewed: { type: Date, default: Date.now },
      totalTime: { type: Number, default: 0 } // в минутах
    }]
  },
  
  diaryEntries: [{
    date: { type: Date, default: Date.now },
    mood: { type: Number }, // 0 - позитивный, 1 - нейтральный, 2 - негативный
    content: { type: String },
    tags: [String],
    wordCount: { type: Number }
  }],
  
  // Общая статистика
  totalSessions: { type: Number, default: 0 },
  totalMinutes: { type: Number, default: 0 },
  streak: { type: Number, default: 0 }, // дней подряд
  lastActiveDate: { type: Date },
  
  // Резильентность
  resilience: {
    current: { type: Number, default: 50 },
    history: [{
      value: Number,
      date: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

// Методы для обновления статистики
userStatsSchema.methods.recordBreathingSession = function(minutes) {
  this.breathingSessions.count += 1;
  this.breathingSessions.totalMinutes += minutes;
  this.breathingSessions.lastSession = new Date();
  this.totalSessions += 1;
  this.totalMinutes += minutes;
  this.lastActiveDate = new Date();
  return this.save();
};

userStatsSchema.methods.recordDiagnostic = function(score, answers) {
  this.diagnosticsTaken.count += 1;
  this.diagnosticsTaken.lastScore = score;
  this.diagnosticsTaken.lastDate = new Date();
  this.diagnosticsTaken.history.push({ score, answers });
  
  // Обновляем резильентность
  this.resilience.current = score;
  this.resilience.history.push({ value: score });
  
  this.lastActiveDate = new Date();
  return this.save();
};

userStatsSchema.methods.recordMaterialView = function(materialId, minutes = 0) {
  const existingMaterial = this.materialsViewed.materials.find(
    m => m.materialId.toString() === materialId.toString()
  );
  
  if (existingMaterial) {
    existingMaterial.viewCount += 1;
    existingMaterial.lastViewed = new Date();
    existingMaterial.totalTime += minutes;
  } else {
    this.materialsViewed.materials.push({
      materialId,
      viewCount: 1,
      lastViewed: new Date(),
      totalTime: minutes
    });
  }
  
  this.materialsViewed.count += 1;
  this.lastActiveDate = new Date();
  return this.save();
};

userStatsSchema.methods.addDiaryEntry = function(mood, content, tags = []) {
  this.diaryEntries.push({
    mood,
    content,
    tags,
    wordCount: content.split(' ').length
  });
  
  this.lastActiveDate = new Date();
  return this.save();
};

userStatsSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = this.lastActiveDate;
  
  if (!lastActive) {
    this.streak = 1;
  } else {
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.streak += 1;
    } else if (daysDiff > 1) {
      this.streak = 1;
    }
  }
  
  this.lastActiveDate = today;
  return this.save();
};

module.exports = mongoose.model('UserStats', userStatsSchema);
