require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Инициализация Supabase клиента
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Тестовые данные
const testWallet = {
    wallet_address: 'EQTest123...', 
    user_id: 'test_user_1'
};

// Функция для тестирования вставки данных
async function testInsert() {
    try {
        const { data, error } = await supabase
            .from('wallets')
            .insert([testWallet])
            .select();

        if (error) throw error;
        console.log('Insert successful:', data);
        return data;
    } catch (error) {
        console.error('Error inserting:', error.message);
    }
}

// Функция для тестирования получения данных
async function testSelect() {
    try {
        const { data, error } = await supabase
            .from('wallets')
            .select('*');

        if (error) throw error;
        console.log('All wallets:', data);
        return data;
    } catch (error) {
        console.error('Error selecting:', error.message);
    }
}

// Функция для тестирования обновления данных
async function testUpdate() {
    try {
        const { data, error } = await supabase
            .from('wallets')
            .update({ connected_at: new Date().toISOString() })
            .eq('wallet_address', testWallet.wallet_address)
            .select();

        if (error) throw error;
        console.log('Update successful:', data);
        return data;
    } catch (error) {
        console.error('Error updating:', error.message);
    }
}

// Функция для тестирования удаления данных
async function testDelete() {
    try {
        const { data, error } = await supabase
            .from('wallets')
            .delete()
            .eq('wallet_address', testWallet.wallet_address)
            .select();

        if (error) throw error;
        console.log('Delete successful:', data);
        return data;
    } catch (error) {
        console.error('Error deleting:', error.message);
    }
}

// Запуск всех тестов
async function runAllTests() {
    console.log('Starting database tests...');
    
    console.log('\n1. Testing INSERT:');
    await testInsert();
    
    console.log('\n2. Testing SELECT:');
    await testSelect();
    
    console.log('\n3. Testing UPDATE:');
    await testUpdate();
    
    console.log('\n4. Testing DELETE:');
    await testDelete();
    
    console.log('\nAll tests completed!');
}

runAllTests();
