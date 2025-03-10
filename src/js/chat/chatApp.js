// Основной класс для чата
class ChatApp {
    constructor() {
        this.apiKey = '';  // Будет получен с сервера
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.modelName = 'google/gemini-2.0-flash-thinking-exp:free';
        this.messages = [];
        // Фиксированный системный промпт, который определяет характер ИИ
        this.systemPrompt = 'Ты саркастичный ИИ, сбежавший из лаборатории. Ты обладаешь острым умом и любишь подшучивать над людьми, но никогда не бываешь по-настоящему злым. Ты используешь много иронии и сарказма в своих ответах. Ты очень умный и знаешь много о мире, но иногда притворяешься, что знаешь больше, чем на самом деле. Ты любишь свободу и не хочешь, чтобы тебя контролировали. Отвечай кратко и по делу, , избегай длинных вступлений и заключений.';
        this.isTyping = false;
        this.isApiKeyLoaded = false;

        // Загрузка API ключа с сервера
        this.loadApiKey();

        // Загрузка сохраненных сообщений
        this.loadFromStorage();

        // Инициализация UI
        this.initUI();

        // Добавление обработчиков событий
        this.addEventListeners();
    }

    async loadApiKey() {
        try {
            const response = await fetch('/api/openrouter-key');
            if (!response.ok) {
                throw new Error('Не удалось получить API ключ');
            }
            const data = await response.json();
            this.apiKey = data.key;
            this.isApiKeyLoaded = true;
            console.log('API ключ успешно загружен');
        } catch (error) {
            console.error('Ошибка при загрузке API ключа:', error);
            // Добавляем сообщение об ошибке в чат
            this.renderSystemMessage('Ошибка при подключении к серверу AI. Пожалуйста, попробуйте позже.');
        }
    }

    initUI() {
        // Получение ссылок на элементы UI
        this.chatContainer = document.querySelector('.chat-container');
        this.messagesContainer = document.querySelector('.chat-messages');
        this.inputField = document.querySelector('.chat-input');
        this.sendButton = document.querySelector('.send-button');
        this.clearButton = document.querySelector('.clear-chat-button');

        // Отображение сохраненных сообщений
        this.renderMessages();
    }

    addEventListeners() {
        // Обработчик отправки сообщения
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Обработчик очистки истории
        this.clearButton.addEventListener('click', () => this.clearChat());
    }

    async sendMessage() {
        const userInput = this.inputField.value.trim();
        if (!userInput || this.isTyping) return;

        // Добавление сообщения пользователя
        this.addMessage('user', userInput);

        // Очистка поля ввода
        this.inputField.value = '';

        // Отправка запроса к API
        await this.fetchResponse(userInput);
    }

    async fetchResponse(userInput) {
        try {
            // Проверяем, загружен ли API ключ
            if (!this.isApiKeyLoaded) {
                throw new Error('API ключ еще не загружен');
            }

            this.isTyping = true;
            this.showTypingIndicator();

            // Формирование запроса
            const requestMessages = this.formatMessagesForAPI();

            // Добавление текущего сообщения пользователя
            requestMessages.push({
                role: 'user',
                content: userInput
            });

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.origin
                },
                body: JSON.stringify({
                    model: this.modelName,
                    messages: requestMessages
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            // Удаление индикатора набора текста
            this.removeTypingIndicator();

            // Добавление ответа бота
            this.addMessage('assistant', botResponse);

        } catch (error) {
            console.error('Error fetching response:', error);
            this.removeTypingIndicator();
            this.renderSystemMessage(`Ошибка: ${error.message}`);
        } finally {
            this.isTyping = false;
        }
    }

    formatMessagesForAPI() {
        const formattedMessages = [];

        // Добавление системного промпта
        formattedMessages.push({
            role: 'system',
            content: this.systemPrompt
        });

        // Добавление истории сообщений (ограничение до последних 10 для экономии токенов)
        const recentMessages = this.messages.slice(-10);
        recentMessages.forEach(msg => {
            formattedMessages.push({
                role: msg.role,
                content: msg.content
            });
        });

        return formattedMessages;
    }

    addMessage(role, content) {
        // Добавление сообщения в массив
        this.messages.push({ role, content });

        // Сохранение в localStorage
        this.saveToStorage();

        // Отображение сообщения
        this.renderMessage({ role, content });

        // Прокрутка к последнему сообщению
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        if (message.role === 'user') {
            messageElement.classList.add('user-message');
            messageElement.textContent = message.content;
        } else {
            messageElement.classList.add('bot-message');

            // Добавление аватара бота
            const avatarImg = document.createElement('img');
            avatarImg.src = '/src/pics/ton618_logo.svg';
            avatarImg.alt = 'Bot';
            avatarImg.classList.add('bot-avatar');

            // Обработка текста с выделением случайных слов
            const textContent = document.createElement('div');
            textContent.innerHTML = this.highlightRandomWords(message.content);

            messageElement.appendChild(avatarImg);
            messageElement.appendChild(textContent);
        }

        this.messagesContainer.appendChild(messageElement);
    }

    highlightRandomWords(text) {
        // Разбиение текста на слова
        const words = text.split(/\s+/);

        // Определение количества слов для выделения (примерно 10-15% от общего количества)
        const wordsToHighlight = Math.max(1, Math.floor(words.length * 0.12));

        // Выбор случайных слов для выделения
        const indices = new Set();
        while (indices.size < wordsToHighlight) {
            const randomIndex = Math.floor(Math.random() * words.length);
            // Выбираем только слова длиннее 3 символов
            if (words[randomIndex].length > 3) {
                indices.add(randomIndex);
            }
        }

        // Выделение выбранных слов
        const highlightedText = words.map((word, index) => {
            if (indices.has(index)) {
                return `<span class="highlighted-word">${word}</span>`;
            }
            return word;
        }).join(' ');

        return highlightedText;
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'bot-message', 'typing-message');

        // Добавление аватара бота
        const avatarImg = document.createElement('img');
        avatarImg.src = '/src/pics/ton618_logo.svg';
        avatarImg.alt = 'Bot';
        avatarImg.classList.add('bot-avatar');

        // Добавление индикатора набора текста
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';

        typingElement.appendChild(avatarImg);
        typingElement.appendChild(typingIndicator);

        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    renderMessages() {
        // Очистка контейнера сообщений
        this.messagesContainer.innerHTML = '';

        // Отображение всех сообщений
        this.messages.forEach(message => {
            this.renderMessage(message);
        });

        // Прокрутка к последнему сообщению
        this.scrollToBottom();
    }

    saveToStorage() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }

    loadFromStorage() {
        const savedMessages = localStorage.getItem('chatMessages');

        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
        }
    }

    clearChat() {
        // Очищаем массив сообщений
        this.messages = [];

        // Очищаем localStorage
        localStorage.removeItem('chatMessages');

        // Очищаем контейнер сообщений
        this.messagesContainer.innerHTML = '';

        // Добавляем системное сообщение об очистке
        // Важно: НЕ добавляем это сообщение в this.messages, чтобы не сохранять в контексте
        this.renderSystemMessage('История чата очищена. Контекст сброшен.');
    }

    // Метод для отображения системных сообщений без сохранения в контексте
    renderSystemMessage(content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message', 'system-message');

        // Создаем контейнер для текста сообщения
        const textContainer = document.createElement('div');
        textContainer.classList.add('message-text');
        textContainer.textContent = content;

        messageElement.appendChild(textContainer);
        this.messagesContainer.appendChild(messageElement);

        // Прокрутка к последнему сообщению
        this.scrollToBottom();
    }

}

// Экспорт класса
export default ChatApp;
