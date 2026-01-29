const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Получаем токен бота из переменных окружения
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let bot;

// Если токен есть, инициализируем бота
if (TOKEN) {
    // Используем polling для разработки (на Railway вебхуки сложнее настроить)
    bot = new TelegramBot(TOKEN, { polling: true });
    
    console.log('✅ Telegram бот инициализирован');
    
    // Команда /start
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'Қадірмен';
        const domain = process.env.RAILWAY_PUBLIC_DOMAIN || 'ramazan-plan.up.railway.app';
        const webAppUrl = `https://${domain}`;
        
        const welcomeMessage = `Ассалаумағалейкум, ${firstName}! 🌙\n\n` +
                              `Рамазан жоспарлаушысына қош келдіңіз!\n\n` +
                              `Қосымшаны ашу үшін төмендегі түймені басыңыз:`;
        
        bot.sendMessage(chatId, welcomeMessage, {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "📱 Рамазан жоспарлаушысын ашу",
                        web_app: { url: webAppUrl }
                    }
                ]]
            }
        });
    });
    
    // Команда /help
    bot.onText(/\/help/, (msg) => {
        const helpText = `🆘 Жәрдем:\n\n` +
                        `/start - Қосымшаны ашу\n` +
                        `/ramazan - Рамазан туралы\n` +
                        `/dua - Күннің дуасы\n` +
                        `/time - Намаз уақыттары\n\n` +
                        `Сұрақтарыңыз болса: @username`;
        
        bot.sendMessage(msg.chat.id, helpText);
    });
    
    // Команда /ramazan
    bot.onText(/\/ramazan/, (msg) => {
        const ramazanInfo = `📅 Рамазан 2024:\n\n` +
                           `Басталуы: 11 Наурыз 2024\n` +
                           `Аяқталуы: 9 Сәуір 2024\n` +
                           `Ораза күндері: 30\n\n` +
                           `Рамазан - тәубе жасау, құран оқу және жақсылық жасау айы.`;
        
        bot.sendMessage(msg.chat.id, ramazanInfo);
    });
} else {
    console.log('⚠️ Telegram бот токені жоқ. Бот жұмыс істемейді.');
}

// Раздача статических файлов
app.use(express.static(__dirname));

// Все пути ведут на index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check для Railway
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Рамазан жоспарлаушысы жұмыс істеуде',
        timestamp: new Date().toISOString(),
        bot: TOKEN ? 'active' : 'inactive'
    });
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
    console.log(`🌐 Домен: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'локальный'}`);
    console.log(`🤖 Бот: ${TOKEN ? 'іске қосылды' : 'жоқ'}`);
});