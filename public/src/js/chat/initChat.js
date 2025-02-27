// Инициализация чата
import ChatApp from './chatApp.js';

// Функция для создания HTML структуры чата
function createChatHTML() {
    const chatHTML = `
        <div class="chat-container">
            <div class="user-info">
                <!-- Здесь будет информация о пользователе -->
            </div>
            <div class="chat-messages">
                <!-- Здесь будут отображаться сообщения -->
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" placeholder="Введите сообщение...">
                <button class="send-button">
                    <img src="/src/pics/ton618_logo.svg" alt="Send">
                </button>
            </div>
        </div>
    `;
    
    return chatHTML;
}

// Функция инициализации чата
function initChat() {
    // Создание HTML структуры чата
    document.body.insertAdjacentHTML('beforeend', createChatHTML());
    
    // Инициализация приложения чата
    const chatApp = new ChatApp();
    
    // Возвращаем экземпляр приложения для возможного использования извне
    return chatApp;
}

export default initChat;
