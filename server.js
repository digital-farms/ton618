const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Настройка CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://*", "wss://*"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://*"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://*"],
            imgSrc: ["'self'", "data:", "blob:", "https://*"],
            fontSrc: ["'self'", "https://*", "data:"],
            frameSrc: ["'self'", "https://*"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Основные middleware
app.use(express.json()); // Для парсинга JSON в теле запроса

// Настройка CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://ton618-stable-ai.vercel.app', 'https://ton618.app', 'https://ton618.vercel.app']
        : 'http://localhost:3000',
    methods: ['GET', 'POST'], // Добавили POST для работы с waitlist
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Защита от DDoS атак
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Инициализация Supabase
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://kozbsjeqafhthbwekhjl.supabase.co',
    process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvemJzamVxYWZodGhid2VraGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNjUyNTIsImV4cCI6MjA1NTc0MTI1Mn0.jjwhtP3qcpI7bsEUXatGQ3OzTXwD6tqCHw9a6MC5d5k'
);

// Статические файлы
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname)));

// API endpoints
app.post('/api/waitlist', async (req, res) => {
    try {
        const userData = req.body;
        const result = await waitlistService.addToWaitlist(userData);
        res.json(result);
    } catch (error) {
        console.error('Waitlist error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/waitlist', async (req, res) => {
    try {
        const waitlist = await waitlistService.getWaitlist();
        res.json(waitlist);
    } catch (error) {
        console.error('Waitlist fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoints для работы с кошельками
app.post('/api/wallet/connect', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({
                error: 'Wallet address is required'
            });
        }
        console.log(`Received wallet address: ${walletAddress}`);

        // Сохраняем в Supabase
        const { data, error } = await supabase
            .from('wallets')
            .insert([{ address: walletAddress }]);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Wallet connection error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/wallet/disconnect', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                error: 'Wallet address is required'
            });
        }

        const result = await walletService.disconnectWallet(walletAddress);
        res.json(result);
    } catch (error) {
        console.error('Wallet disconnection error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/wallet/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const wallet = await walletService.getWalletByAddress(address);

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json(wallet);
    } catch (error) {
        console.error('Wallet fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/wallet/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const wallets = await walletService.getUserWallets(userId);
        res.json(wallets);
    } catch (error) {
        console.error('User wallets fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint для сохранения адреса кошелька
app.post('/api/save-wallet', async (req, res) => {
    try {
        const { address } = req.body;
        const { data, error } = await supabase
            .from('wallets')
            .insert([{ address }]);

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error saving wallet:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint для получения API ключа OpenRouter
app.get('/api/openrouter-key', (req, res) => {
    // Отправляем только публичную часть ключа или специальный токен для фронтенда
    res.json({ 
        key: process.env.OPENROUTER_API_KEY || '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'
    });
});

// Маршруты для страниц
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/waitlist.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'waitlist.html'));
});

app.get('/waitlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'waitlist.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Запуск сервера
const host = process.env.NODE_ENV === 'production' ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 3001;

app.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});
