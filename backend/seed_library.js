import mongoose from "mongoose";
import dotenv from "dotenv";
import Material from "./models/Material.js";

dotenv.config();

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shelter_db";

const materials = [
    {
        title: "Практика 4-7-8: Дихальна техніка",
        desc: "Ефективний спосіб розслаблення через контроль дихання.",
        category: "anxiety",
        type: "video",
        icon: "📹",
        url: "https://www.youtube.com/watch?v=HnPvg0qtcXs",
        duration: "3 хв",
        content: "Ця техніка допомагає швидко заспокоїти нервову систему. Використовуйте її, коли відчуваєте раптову тривогу або не можете заснути."
    },
    {
        title: "Йога для шиї та плечей",
        desc: "Знімаємо скутість та напруження після робочого дня.",
        category: "stress",
        type: "video",
        icon: "🧘",
        url: "https://www.youtube.com/watch?v=9RjOL9ltjf4",
        duration: "10 хв",
        content: "Більшість стресу накопичується саме в шиї та плечах. Цей короткий комплекс допоможе вам відчути полегшення."
    },
    {
        title: "Дихання спокою: Медитація",
        desc: "3 хвилини глибокого розслаблення українською мовою.",
        category: "general",
        type: "video",
        icon: "💤",
        url: "https://www.youtube.com/watch?v=vpI5tJlQe04",
        duration: "3 хв",
        content: "Коротка, але дуже ефективна медитація. Просто закрийте очі та слідуйте за голосом."
    },
    {
        title: "Техніка активації вагусу",
        desc: "Вправа 'Перезавантаження' для блукаючого нерву.",
        category: "general",
        type: "video",
        icon: "⚡",
        url: "https://www.youtube.com/watch?v=w4-ygBT0a8E",
        duration: "2 хв",
        content: "Активація вагусу — це найшвидший фізіологічний спосіб перемкнути організм із режиму 'бий або біжи' у режим 'відпочивай та перетравлюй'."
    },
    {
        title: "Активний ранок: Зарядка",
        desc: "Проста та ефективна розминка для всієї родини.",
        category: "general",
        type: "video",
        icon: "☀️",
        url: "https://www.youtube.com/watch?v=wHxuIMUK9d4",
        duration: "5 хв",
        content: "Всього 5 хвилин активних рухів зранку подарують вам енергію на весь день."
    },
    {
        title: "Аудіо-медитація спокою",
        desc: "Глибоке занурення у стан внутрішньої тиші під м'який ембієнт.",
        category: "general",
        type: "audio",
        icon: "🎧",
        url: "/audio/273e9df1b005c0353501aa1b00fbfff22a424.mp3",
        duration: "10 хв",
        content: "Ваша особиста аудіо-практика для глибокого розслаблення."
    },
    {
        title: "Шум дощу (1 година)",
        desc: "Природний рожевий шум, що створює затишну акустичну завісу.",
        category: "general",
        type: "audio",
        icon: "🌧️",
        url: "/audio/zvuk_dlya_sna_-_shum_dozhdya_1_chas_(SkySound.cc).mp3",
        duration: "60 хв",
        content: "Година заспокійливого шуму дощу для сну або роботи."
    }
];

async function seed() {
    try {
        await mongoose.connect(dbURI);
        console.log("✅ Connected to MongoDB");
        
        // Оскільки ми змінили назви, краще видалити старі записи, щоб не було дублів з неправильними назвами
        await Material.deleteMany({ title: { $in: [
            "Техніка дихання 4-7-8", 
            "Йога для зняття стресу", 
            "Керована медитація перед сном", 
            "Звуки дощу для концентрації", 
            "Звуки природи для заспокоєння",
            "Як подолати панічну атаку",
            "Ранкова руханка для енергії"
        ]}});

        for (const mat of materials) {
            await Material.findOneAndUpdate(
                { title: mat.title },
                mat,
                { upsert: true, new: true }
            );
        }
        
        console.log("✅ Library updated with CORRECT mapping successfully");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding materials:", err);
        process.exit(1);
    }
}

seed();
