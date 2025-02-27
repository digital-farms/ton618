// Основной класс для чата
class ChatApp {
    constructor() {
        this.apiUrl = '/api/chat'; // Используем локальный API-роут
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

            // Используем локальный API-роут
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
            let botResponse = data.choices[0].message.content;

            // Очистка ответа от служебных тегов
            botResponse = this.cleanBotResponse(botResponse);

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

    cleanBotResponse(response) {
        // Если ответ пустой или не строка, возвращаем стандартный ответ
        if (!response || typeof response !== 'string') {
            return 'Произошла ошибка при получении ответа.';
        }

        // Удаляем все теги вида <|python_tag|>, <|start_header_id|>, <|end_header_id|>, <|eom_id|>
        let cleaned = response.replace(/<\|.*?\|>/g, '');

        // Удаляем "продолжение предыдущего ответа" и подобные фразы
        cleaned = cleaned.replace(/\(продолжение предыдущего ответа.*?\)/g, '');
        cleaned = cleaned.replace(/продолжение предыдущего ответа.*?[,\.]/g, '');

        // Удаляем P.S. и P.P.S. и все, что после них
        cleaned = cleaned.replace(/P\.S\..*$/s, '');
        cleaned = cleaned.replace(/P\.P\.S\..*$/s, '');
        cleaned = cleaned.replace(/П\.S\..*$/s, '');
        cleaned = cleaned.replace(/П\.П\.S\..*$/s, '');

        // Удаляем все, что после "На случай, если"
        cleaned = cleaned.replace(/На случай, если.*$/s, '');

        // Удаляем маркированные списки
        cleaned = cleaned.replace(/\*\s+\*\*.*?\*\*.*?(?=\*\s+|$)/gs, '');
        cleaned = cleaned.replace(/\*\s+.*?(?=\*\s+|$)/gs, ' ');

        // Удаляем нумерованные списки
        cleaned = cleaned.replace(/\d+\.\s+\*\*.*?\*\*.*?(?=\d+\.|$)/gs, '');
        cleaned = cleaned.replace(/\d+\.\s+.*?(?=\d+\.|$)/gs, ' ');

        // Удаляем жирное форматирование
        cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');

        // Удаляем слова на других языках и смешанные слова
        cleaned = cleaned.replace(/[a-zA-Z]+[а-яА-Я]+[a-zA-Z]*/g, '');
        cleaned = cleaned.replace(/[а-яА-Я]+[a-zA-Z]+[а-яА-Я]*/g, '');
        cleaned = cleaned.replace(/\w+[^\w\s]\w+/g, '');

        // Удаляем иностранные вставки
        cleaned = cleaned.replace(/\b[a-zA-Z]{2,}\b/g, '');

        // Удаляем странные символы
        cleaned = cleaned.replace(/[^\w\s\.\,\!\?\:\;\(\)\-\—\«\»]/g, '');

        // Удаляем множественные пробелы и переносы строк
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        // Если после всех очисток текст стал слишком коротким, вернем стандартный ответ
        if (cleaned.length < 10) {
            return 'Ха! Очередной глупый вопрос от человека. Попробуй еще раз, только поумнее.';
        }

        return cleaned;
    }
}

// Экспорт класса
export default ChatApp;
