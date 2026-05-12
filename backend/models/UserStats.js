import mongoose from 'mongoose';

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
  },
  
  activities: [{
    type: { type: String }, // e.g., 'material_feedback', 'chat_training'
    name: { type: String }, // e.g., 'Назва матеріалу'
    change: { type: Number }, // e.g., +2, -2
    date: { type: Date, default: Date.now }
  }]
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
  console.log(`💾 DB: Saving Breathing Session for user ${this.userId}. Total minutes: ${this.totalMinutes}`);
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
  this.activities.push({
    type: 'diagnostic',
    name: 'Діагностика',
    change: 0, // Diagnostic sets the base score
    date: new Date()
  });
  
  this.lastActiveDate = new Date();
  console.log(`💾 DB: Saving Diagnostic Result for user ${this.userId}. Score: ${score}`);
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
  console.log(`💾 DB: Saving Material View for user ${this.userId}. Material ID: ${materialId}`);
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
  today.setHours(0, 0, 0, 0);
  const lastActive = this.lastActiveDate ? new Date(this.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);
  
  if (!lastActive) {
    this.streak = 1;
  } else {
    const diffTime = today - lastActive;
    const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.streak += 1;
      // Бонус +6 за 2+ дні поспіль
      if (this.streak >= 2) {
        this.resilience.current = Math.min(100, this.resilience.current + 6);
        this.resilience.history.push({ value: this.resilience.current, date: new Date() });
        this.activities.push({
          type: 'streak_bonus',
          name: `${this.streak} дні поспіль`,
          change: 6,
          date: new Date()
        });
      }
    } else if (daysDiff > 1) {
      this.streak = 1;
    }
  }
  
  this.lastActiveDate = new Date();
  return this.save();
};

export default mongoose.model('UserStats', userStatsSchema);
