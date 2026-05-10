const mongoose = require('mongoose');

// Прямое подключение к MongoDB
const mongoURI = 'mongodb+srv://useruser:IlfXW3TQLASjLZv8@clustern.reruo2j.mongodb.net/shelter_db?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Динамический импорт моделей
let Material, Scenario, Account;

// Новые материалы для добавления
const newMaterials = [
  {
    title: "Вечірня релаксація",
    desc: "Спокойная медитация для глубокого расслабления перед сном",
    type: "audio",
    category: "general",
    content: "Лягте удобно, закройте глаза и начните дышать медленно и глубоко...",
    url: "https://example.com/evening-relaxation.mp3",
    duration: 15
  },
  {
    title: "Дихання при паніці",
    desc: "Быстрая техника для снятия панической атаки",
    type: "video", 
    category: "anxiety",
    content: "Когда чувствуете панику, используйте технику 4-7-8...",
    url: "https://www.youtube.com/watch?v=example1",
    duration: 5
  },
  {
    title: "Як подолати безсоння",
    desc: "Эффективные методы борьбы с бессонницей",
    type: "text",
    category: "stress", 
    content: "Бессонница может быть вызвана многими факторами. Вот проверенные методы...",
    duration: 10
  },
  {
    title: "Звуки лісу",
    desc: "Природные звуки для медитации и релаксации",
    type: "audio",
    category: "general",
    content: "Звуки леса помогают снизить уровень кортизола и улучшить концентрацию...",
    url: "https://example.com/forest-sounds.mp3",
    duration: 30
  },
  {
    title: "Ранкова руханка",
    desc: "Утренние упражнения для бодрости и энергии",
    type: "video",
    category: "general",
    content: "Начните день с простой 10-минутной зарядки...",
    url: "https://www.youtube.com/watch?v=example2",
    duration: 12
  },
  {
    title: "Психологія стійкості",
    desc: "Научные основы психологической устойчивости",
    type: "text",
    category: "general",
    content: "Психологическая устойчивость - это способность адаптироваться к стрессу...",
    duration: 15
  },
  {
    title: "Техніка 4-7-8 дихання",
    desc: "Мощная техника для мгновенного расслабления",
    type: "video",
    category: "anxiety",
    content: "Вдох на 4 счета, задержка на 7, выдох на 8...",
    url: "https://www.youtube.com/watch?v=example3",
    duration: 8
  },
  {
    title: "Прогресивна м'язова релаксація",
    desc: "Пошаговая техника снятия мышечного напряжения",
    type: "audio",
    category: "stress",
    content: "Начните с пальцев ног и постепенно расслабляйте каждую группу мышц...",
    url: "https://example.com/progressive-relaxation.mp3",
    duration: 20
  },
  {
    title: "Майндфулнес для початківців",
    desc: "Введение в практику осознанности",
    type: "text",
    category: "general",
    content: "Осознанность - это практика внимания к настоящему моменту...",
    duration: 12
  },
  {
    title: "Керування гнівом",
    desc: "Эффективные стратегии управления гневом",
    type: "video",
    category: "anxiety",
    content: "Гнев - это нормальная эмоция, важно научиться им управлять...",
    url: "https://www.youtube.com/watch?v=example4",
    duration: 15
  },
  {
    title: "Сон і відновлення",
    desc: "Важность сна для ментального здоровья",
    type: "text",
    category: "general",
    content: "Качественный сон критически важен для психологического благополучия...",
    duration: 10
  },
  {
    title: "Аутогенний тренінг",
    desc: "Техника саморегуляции и расслабления",
    type: "audio",
    category: "stress",
    content: "Аутогенный тренинг разработан Иоганном Шульцем...",
    url: "https://example.com/autogenic-training.mp3",
    duration: 25
  }
];

async function resetDatabase() {
  try {
    // Динамический импорт моделей
    const MaterialModel = await import('../models/Material.js');
    const ScenarioModel = await import('../models/Scenario.js');
    const AccountModel = await import('../models/Account.js');
    
    const Material = MaterialModel.default;
    const Scenario = ScenarioModel.default;
    const Account = AccountModel.default;
    
    console.log('🔄 Очистка базы данных...');
    
    // Удаление всех материалов
    const materialCount = await Material.countDocuments();
    console.log(`📊 Найдено материалов: ${materialCount}`);
    await Material.deleteMany({});
    console.log('✅ Все материалы удалены');
    
    // Удаление всех сценариев
    const scenarioCount = await Scenario.countDocuments();
    console.log(`📊 Найдено сценариев: ${scenarioCount}`);
    await Scenario.deleteMany({});
    console.log('✅ Все сценарии удалены');
    
    // Сохранение аккаунтов (не удаляем их)
    const accountCount = await Account.countDocuments();
    console.log(`📊 Аккаунтов сохранено: ${accountCount}`);
    
    console.log('🔄 Добавление новых материалов...');
    
    // Добавление новых материалов
    const insertedMaterials = await Material.insertMany(newMaterials);
    console.log(`✅ Добавлено материалов: ${insertedMaterials.length}`);
    
    // Вывод добавленных материалов
    insertedMaterials.forEach((material, index) => {
      console.log(`${index + 1}. ${material.title} (${material.type}) - ${material.category}`);
    });
    
    console.log('🎉 База данных успешно обновлена!');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении базы данных:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Соединение с MongoDB закрыто');
    process.exit(0);
  }
}

// Запуск скрипта
resetDatabase();
