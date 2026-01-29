const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

// Загружаем переменные окружения
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация бота (в продакшене используется вебхук, но для Railway пока polling)
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let bot;

if (TOKEN) {
    bot = new TelegramBot(TOKEN, { polling: false });
    
    // Настройка вебхука для Railway
    const WEB_APP_URL = process.env.RAILWAY_STATIC_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    
    if (WEB_APP_URL) {
        bot.setWebHook(`${WEB_APP_URL}/bot${TOKEN}`);
    }
    
    console.log('Telegram бот инициализирован');
} else {
    console.log('TELEGRAM_BOT_TOKEN не установлен. Бот не будет работать.');
}

// Статические файлы
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Проверка работоспособности
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Рамазан планировщик работает',
        timestamp: new Date().toISOString()
    });
});

// Webhook для Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Обработка команд бота
if (bot) {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'Қадірмен';
        
        const welcomeMessage = `Ассалаумағалейкум, ${firstName}! 🌙\n\n` +
                              `Рамазан жоспарлаушысына қош келдіңіз!\n\n` +
                              `Қосымшаны ашу үшін төмендегі түймені басыңыз:`;
        
        bot.sendMessage(chatId, welcomeMessage, {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "📱 Рамазан жоспарлаушысын ашу",
                        web_app: { url: process.env.RAILWAY_STATIC_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` }
                    }
                ]]
            }
        });
    });
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер іске қосылды: http://localhost:${PORT}`);
    console.log(`Telegram бот: ${TOKEN ? 'Іске қосылды' : 'Қосылмады (токен жоқ)'}`);
});