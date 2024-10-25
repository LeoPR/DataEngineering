// utils.js

export function showFeedbackMessage(message, isSuccess) {
    const feedbackMessage = document.getElementById('feedback-message');
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message';
    feedbackMessage.classList.add(isSuccess ? 'success' : 'error');
    feedbackMessage.style.display = 'block';

    setTimeout(() => {
        feedbackMessage.style.display = 'none';
    }, 3000);
}

export function addChatMessage(message, sender) {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

export function addChatButton(button) {
    const chatWindow = document.getElementById('chat-window');
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('chat-button-container');
    buttonContainer.appendChild(button);
    chatWindow.appendChild(buttonContainer);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
