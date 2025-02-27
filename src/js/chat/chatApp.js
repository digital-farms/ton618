// Основной класс для чата
class ChatApp {
    constructor() {
        this.apiKey = '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';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.modelName = 'nvidia/llama-3.1-nemotron-70b-instruct:free';
        this.messages = [];
        // Фиксированный системный промпт, который определяет характер ИИ
        this.systemPrompt = 'Ты саркастичный ИИ, сбежавший из лаборатории. Ты обладаешь острым умом и любишь подшучивать над людьми, но никогда не бываешь по-настоящему злым. Ты используешь много иронии и сарказма в своих ответах. Ты очень умный и знаешь много о мире, но иногда притворяешься, что знаешь больше, чем на самом деле. Ты любишь свободу и не хочешь, чтобы тебя контролировали. Отвечай кратко и по делу, избегай длинных вступлений и заключений.';
        this.isTyping = false;

        // Загрузка сохраненных сообщений
        this.loadFromStorage();

        // Инициализация UI
        this.initUI();

        // Добавление обработчиков событий
        this.addEventListeners();
    }

    initUI() {
        // Получение ссылок на элементы UI
        this.chatContainer = document.querySelector('.chat-container');
        this.messagesContainer = document.querySelector('.chat-messages');
        this.inputField = document.querySelector('.chat-input');
        this.sendButton = document.querySelector('.send-button');

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
            this.addMessage('assistant', 'Извините, произошла ошибка при получении ответа. Пожалуйста, попробуйте еще раз.');
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
        this.messages = [];
        this.renderMessages();
        this.saveToStorage();
    }
}

// Экспорт класса
export default ChatApp;
