const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

// Telegram бот
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'ВАШ_ТОКЕН';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://ваш-домен.railway.app';
const bot = new TelegramBot(TOKEN, { polling: true });

// Статические файлы
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API для сохранения данных
app.post('/api/save-data', (req, res) => {
    // Здесь можно сохранять данные в базу данных
    console.log('Данные получены:', req.body);
    res.json({ success: true });
});

// Telegram Web App проверка
app.get('/tg-web-app', (req, res) => {
    res.json({
        name: "Рамадан Жоспарлаушысы",
        version: "1.0.0",
        platform: "telegram"
    });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Web App URL: ${WEB_APP_URL}`);
});

// ===== TELEGRAM BOT ЛОГИКА =====

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Қадірмен';
    
    const keyboard = {
        inline_keyboard: [[
            {
                text: "📱 Рамадан жоспарлаушысын ашу",
                web_app: { url: WEB_APP_URL }
            }
        ]],
        resize_keyboard: true
    };

    const message = `Ассалаумағалейкум, ${firstName}! 🌙\n\n` +
                   `Рамадан жоспарлаушысына қош келдіңіз!\n` +
                   `Бұл қосымша сізге:\n` +
                   `✅ Ораза күнтізбесін сақтау\n` +
                   `✅ Ифтар/сәхәр уақыттарын бақылау\n` +
                   `✅ Күнделікті мақсаттарды қою\n` +
                   `✅ Дуаларды үйрену\n` +
                   `✅ Статистиканы көру\n\n` +
                   `Қосымшаны ашуды басыңыз 👇`;

    bot.sendMessage(chatId, message, {
        reply_markup: keyboard
    });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpText = `🆘 Жәрдем:\n\n` +
                    `/start - Қосымшаны бастау\n` +
                    `/ramadan - Рамадан туралы ақпарат\n` +
                    `/dua - Күннің дуасы\n` +
                    `/time - Намаз уақыттары\n` +
                    `/settings - Баптаулар\n\n` +
                    `Сұрақтарыңыз болса, @username хабарласыңыз.`;
    
    bot.sendMessage(chatId, helpText);
});

// Команда /ramadan
bot.onText(/\/ramadan/, (msg) => {
    const chatId = msg.chat.id;
    
    const ramadanInfo = `📅 Рамадан 2024:\n\n` +
                       `Басталуы: 11 Наурыз 2024\n` +
                       `Аяқталуы: 9 Сәуір 2024\n` +
                       `Ораза күндері: 30\n\n` +
                       `Рамадан - құдайға жақындау, тәубе жасау және ізгі амалдар айы.\n` +
                       `Ораза Аллаһтың бұйрығы, оны сақтау міндет.`;
    
    bot.sendMessage(chatId, ramadanInfo);
});

// Ежедневные уведомления
function sendDailyNotification(chatId) {
    const now = new Date();
    const hours = now.getHours();
    
    let message = '';
    
    if (hours === 4) {
        message = "🌅 Сәхәр уақыты! Ораза тұтуға дайын болыңыз. Су ішіп, тамақтаныңыз!";
    } else if (hours === 19) {
        message = "🌙 Ифтар уақыты жақындады! Дастархан дайындаңыз және дуа оқыңыз.";
    } else if (hours === 13) {
        message = "📖 Құран оқу уақыты! Бүгін 1 жүз оқып шығыңыз.";
    }
    
    if (message) {
        bot.sendMessage(chatId, message);
    }
}

// Обработка сообщений из Web App
bot.on('message', (msg) => {
    if (msg.web_app_data) {
        const data = JSON.parse(msg.web_app_data.data);
        console.log('Данные из Web App:', data);
        
        // Здесь можно обработать данные и сохранить в БД
        bot.sendMessage(msg.chat.id, 'Деректеріңіз сақталды! ✅');
    }
});

console.log('Telegram бот іске қосылды!');