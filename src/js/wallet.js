// Функция для подключения TON кошелька
async function connectTonWallet() {
    try {
        // Проверяем, доступен ли TON кошелек
        if (!window.tonConnectUI) {
            throw new Error('TON Wallet not found! Please install TON Wallet extension.');
        }

        // Инициализируем TON Connect
        const tonConnect = new window.TonConnect();
        
        // Подключаемся к кошельку
        const wallet = await tonConnect.connect();
        
        if (!wallet || !wallet.address) {
            throw new Error('Failed to connect wallet');
        }

        // Отправляем данные на сервер
        const response = await fetch('/api/wallet/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletAddress: wallet.address,
                userId: generateUserId() // Или получите userId другим способом
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save wallet data');
        }

        // Обновляем UI
        updateWalletUI(wallet.address);
        
        return wallet;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showError(error.message);
        throw error;
    }
}

// Функция для отключения кошелька
async function disconnectTonWallet(walletAddress) {
    try {
        const response = await fetch('/api/wallet/disconnect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress })
        });

        if (!response.ok) {
            throw new Error('Failed to disconnect wallet');
        }

        // Обновляем UI
        updateWalletUI(null);
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
        showError(error.message);
        throw error;
    }
}

// Вспомогательные функции
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

function updateWalletUI(address) {
    const connectButton = document.getElementById('connect-wallet');
    const walletAddress = document.getElementById('wallet-address');
    
    if (address) {
        connectButton.textContent = 'Disconnect Wallet';
        connectButton.onclick = () => disconnectTonWallet(address);
        walletAddress.textContent = `Connected: ${address}`;
    } else {
        connectButton.textContent = 'Connect TON Wallet';
        connectButton.onclick = connectTonWallet;
        walletAddress.textContent = 'Not connected';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}
