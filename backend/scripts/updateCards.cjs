const mongoose = require('mongoose');

// Прямое подключение к MongoDB
const mongoURI = 'mongodb+srv://useruser:IlfXW3TQLASjLZv8@clustern.reruo2j.mongodb.net/shelter_db?retryWrites=true&w=majority';

mongoose.connect(mongoURI).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Материалы для главных карточек
const mainCardsMaterials = [
  {
    title: "Дихання для спокою",
    desc: "Освойте технику 4-7-8 для мгновенного расслабления и снижения тревоги. Эта простая но мощная техника помогает активировать парасимпатическую нервную систему.",
    type: "video",
    category: "anxiety",
    content: "Техника дыхания 4-7-8: Вдох на 4 счета, задержка на 7, выдох на 8. Помогает быстро вернуть состояние спокойствия.",
    url: "https://www.youtube.com/watch?v=uYrZg2yqZ_Q",
    duration: 8
  },
  {
    title: "Техника прогрессивной релаксации",
    desc: "Пошаговая методика снятия мышечного напряжения через последовательное напряжение и расслабление разных групп мышц.",
    type: "audio",
    category: "stress",
    content: "Прогрессивная мышечная релаксация: поочередно напрягайте и расслабляйте группы мышц от стоп до лица.",
    url: "https://example.com/progressive-relaxation.mp3",
    duration: 20
  },
  {
    title: "Медитация осознанности для начинающих",
    desc: "Введение в практику майндфулнес - концентрация на дыхании и настоящем моменте без осуждения.",
    type: "text",
    category: "general",
    content: "Медитация осознанности: сядьте удобно, закройте глаза, сосредоточьтесь на дыхании. Когда мысли отвлекают, мягко возвращайте внимание к дыханию.",
    duration: 15
  },
  {
    title: "Диагностика психологического состояния",
    desc: "Комплексная оценка вашего ментального здоровья через анализ уровня стресса, тревоги, апатии и общей жизненной удовлетворенности.",
    type: "text",
    category: "general",
    content: "Диагностика включает оценку стресса, тревоги, апатии и общего благополучия. Помогает определить зоны для улучшения.",
    duration: 20
  },
  {
    title: "Психологическая устойчивость: научные основы",
    desc: "Подробное руководство по развитию психологической устойчивости на основе последних исследований в области нейробиологии.",
    type: "text",
    category: "general",
    content: "Психологическая устойчивость - это способность адаптироваться к стрессам и восстанавливаться после трудностей. Развивается через практику.",
    duration: 25
  },
  {
    title: "Ведение дневника рефлексии",
    desc: "Пошаговое руководство по ведению эффективного дневника для самопознания, эмоциональной регуляции и отслеживания личностного роста.",
    type: "text",
    category: "general",
    content: "Дневник рефлексии помогает развить самосознание, улучшить эмоциональную регуляцию и найти смысл в пережитом опыте.",
    duration: 18
  }
];

async function updateMainCards() {
  try {
    const MaterialModel = await import('../models/Material.js');
    const Material = MaterialModel.default;
    
    console.log('🔄 Обновление главных карточек...');
    
    await Material.deleteMany({});
    console.log('✅ Существующие материалы удалены');
    
    const insertedMaterials = await Material.insertMany(mainCardsMaterials);
    console.log(`✅ Добавлено материалов: ${insertedMaterials.length}`);
    
    insertedMaterials.forEach((material, index) => {
      console.log(`${index + 1}. ${material.title} (${material.type}) - ${material.category}`);
    });
    
    console.log('🎉 Главные карточки успешно обновлены!');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении карточек:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Соединение с MongoDB закрыто');
    process.exit(0);
  }
}

updateMainCards();
