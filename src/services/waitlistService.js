const supabase = require('../config/supabase');

class WaitlistService {
    /**
     * Добавить пользователя в список ожидания
     * @param {Object} userData - Данные пользователя
     * @returns {Promise}
     */
    async addToWaitlist(userData) {
        try {
            const { data, error } = await supabase
                .from('waitlist')
                .insert([
                    {
                        email: userData.email,
                        name: userData.name,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding to waitlist:', error);
            throw error;
        }
    }

    /**
     * Получить список всех пользователей в списке ожидания
     * @returns {Promise}
     */
    async getWaitlist() {
        try {
            const { data, error } = await supabase
                .from('waitlist')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching waitlist:', error);
            throw error;
        }
    }
}

module.exports = new WaitlistService();
