const supabase = require('../config/supabase');

class WalletService {
    /**
     * Сохранить информацию о подключенном кошельке
     * @param {string} walletAddress - Адрес кошелька TON
     * @param {string} userId - ID пользователя
     * @returns {Promise}
     */
    async connectWallet(walletAddress, userId) {
        try {
            const { data, error } = await supabase
                .from('wallets')
                .insert([
                    {
                        wallet_address: walletAddress,
                        user_id: userId,
                        connected_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    /**
     * Получить информацию о кошельке по адресу
     * @param {string} walletAddress - Адрес кошелька TON
     * @returns {Promise}
     */
    async getWalletByAddress(walletAddress) {
        try {
            const { data, error } = await supabase
                .from('wallets')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching wallet:', error);
            throw error;
        }
    }

    /**
     * Получить все кошельки пользователя
     * @param {string} userId - ID пользователя
     * @returns {Promise}
     */
    async getUserWallets(userId) {
        try {
            const { data, error } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', userId)
                .order('connected_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user wallets:', error);
            throw error;
        }
    }

    /**
     * Отключить кошелек
     * @param {string} walletAddress - Адрес кошелька TON
     * @returns {Promise}
     */
    async disconnectWallet(walletAddress) {
        try {
            const { data, error } = await supabase
                .from('wallets')
                .delete()
                .eq('wallet_address', walletAddress);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            throw error;
        }
    }
}

module.exports = new WalletService();
