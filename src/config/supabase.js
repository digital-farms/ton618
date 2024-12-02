const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Создание клиента Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

module.exports = supabase;
