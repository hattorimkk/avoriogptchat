const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator'); // Lấy element typing indicator

let currentThreadId = localStorage.getItem('currentThreadId') || null;
let apiUrl = "https://specific-christye-avoriovietnam-a5af5ba3.koyeb.app"; 
// Hàm tạo Thread mới
const createThread = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/create-thread`, {
            method: 'POST',
        });
        const data = await response.json();
        currentThreadId = data.threadId;
        localStorage.setItem('currentThreadId', currentThreadId);
        loadChatHistory(currentThreadId); // Load lịch sử chat sau khi tạo thread
    } catch (error) {
        console.error('Error creating thread:', error);
    }
};

const loadChatHistory = async (threadId) => {
    try {
        const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];

        if (storedMessages.length > 0) {

            chatMessages.innerHTML = '';
            storedMessages.forEach(message => {
                addMessageToChat(message.content, message.role === 'user' ? 'user' : 'assistant');
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return;
        }

        const response = await fetch(`${apiUrl}/api/chats/${threadId}`);
        const chatHistory = await response.json();

        if (!Array.isArray(chatHistory)) {
            console.error("Invalid chat history format:", chatHistory);
            return;
        }

        chatMessages.innerHTML = '';
        chatHistory.forEach(message => {
            addMessageToChat(message.content, message.role === 'user' ? 'user' : 'assistant');
        });

        localStorage.setItem('chatMessages', JSON.stringify(chatHistory));
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error('Error loading chat history:', error);
    }
};

const sendMessage = async () => {
    const message = messageInput.value.trim();
    if (message === '' || !currentThreadId) return;

    addMessageToChat(message, 'user');
    messageInput.value = '';

    // Ẩn các câu hỏi gợi ý cũ
    hideSuggestedQuestions();

    typingIndicator.style.display = 'block';

    try {
        const response = await fetch(apiUrl + '/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, threadId: currentThreadId }),
        });
        const data = await response.json();

        // Hiển thị tin nhắn của assistant
        addMessageToChat(data.message, 'assistant');

        // Hiển thị các gợi ý câu hỏi dưới dạng button
        if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
            addSuggestedQuestions(data.suggestedQuestions);
        }

        // Lưu tin nhắn vào localStorage
        const currentMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        currentMessages.push({ content: message, role: 'user' });
        currentMessages.push({ content: data.message, role: 'assistant' });
        localStorage.setItem('chatMessages', JSON.stringify(currentMessages));

    } catch (error) {
        console.error('Error sending message:', error);
        addMessageToChat('Sorry, something went wrong. Please try again later.', 'assistant');
    } finally {
        typingIndicator.style.display = 'none';
    }
};


// Hàm thêm tin nhắn vào giao diện
const addMessageToChat = (message, sender) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.innerHTML = marked.parse(message);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Hàm hiển thị các gợi ý câu hỏi
function addSuggestedQuestions(questions) {
    const suggestedQuestionsContainer = document.createElement('div');
    suggestedQuestionsContainer.classList.add('suggested-questions');
    suggestedQuestionsContainer.setAttribute('id', 'suggested-questions'); // Add id attribute
    questions.forEach(question => {
        const button = document.createElement('button');
        button.classList.add('question-button'); // Thêm class cho button
        button.textContent = question;
        button.addEventListener('click', () => {
            messageInput.value = question;
            sendMessage(); // Gửi câu hỏi khi click vào button
        });

        suggestedQuestionsContainer.appendChild(button);
    });

    chatMessages.appendChild(suggestedQuestionsContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hàm ẩn các câu hỏi gợi ý
function hideSuggestedQuestions() {
  const suggestedQuestionsContainer = document.getElementById('suggested-questions');
  if (suggestedQuestionsContainer) {
    suggestedQuestionsContainer.remove();
  }
}

// Xử lý sự kiện click nút Send
sendButton.addEventListener('click', sendMessage);

// Xử lý sự kiện nhấn Enter
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Kiểm tra xem có threadId trong localStorage không
if (currentThreadId) {
    loadChatHistory(currentThreadId);
} else {
    createThread();
}