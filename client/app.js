// app.js

// Configuration
const { OLLAMA_BASE_URL } = window.CONFIG;

// Global Variables
let modelDescriptions = {};

// Initialization
document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const [models, descriptions] = await Promise.all([
            fetchModels(),
            fetchModelDescriptions()
        ]);
        modelDescriptions = descriptions;
        populateModelSelect(models, descriptions);
    } catch (error) {
        console.error('Initialization Error:', error);
        showFeedbackMessage('Error initializing application.', false);
    }
}

// Fetch Models
async function fetchModels() {
    console.log("Fetching models from API...");
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) throw new Error('Failed to fetch models.');
    const data = await response.json();
    console.log("Models fetched:", data.models);
    return data.models;
}

// Fetch Model Descriptions
async function fetchModelDescriptions() {
    console.log("Fetching model descriptions...");
    const response = await fetch('models_descriptions.json');
    if (!response.ok) throw new Error('Failed to fetch model descriptions.');
    const data = await response.json();
    console.log("Model descriptions fetched:", data.models);
    return data.models;
}

// Populate Model Select
function populateModelSelect(models, descriptions) {
    const modelSelect = document.getElementById('model-select');
    modelSelect.innerHTML = ''; // Clear existing options

    if (!models.length) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No models available';
        modelSelect.appendChild(option);
        return;
    }

    models.forEach(model => {
        if (model && model.name) {
            const { title } = getCompleteDescription(model.name, descriptions);
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = `${title} - ${model.name}`; // Show title and model name
            modelSelect.appendChild(option);
        } else {
            console.warn('Model is undefined or missing a name:', model);
        }
    });

    const defaultModel = localStorage.getItem('defaultModel') || models[0]?.name;
    modelSelect.value = defaultModel || '';

    showModelDetails(modelSelect.value, descriptions);
}

// Simplified Get Complete Description
function getCompleteDescription(modelName, descriptions) {
    if (!descriptions) {
        return { title: modelName, summary: '', description: '' };
    }

    // Get the user's preferred language
    const userLanguage = navigator.language || navigator.userLanguage; // e.g., "en-US", "pt-BR"
    const languageCode = userLanguage.includes('pt') ? 'pt-br' : 'en-us'; // Default to 'pt-br' if in Portuguese

    // Directly get the model description using the model name
    const modelDesc = descriptions[modelName];

    // If the model isn't found, attempt to use the base model name (before any colon)
    if (!modelDesc) {
        const baseModelName = modelName.split(':')[0];
        const baseModelDesc = descriptions[baseModelName];
        if (baseModelDesc) {
            return baseModelDesc;
        } else {
            // If still not found, return a default description
            return { title: modelName, summary: '', description: '' };
        }
    }

    // Safely return the description in the preferred language
    return {
        title: modelDesc.title[languageCode] || modelName,
        summary: modelDesc.summary[languageCode] || '',
        description: modelDesc.description[languageCode] || ''
    };
}



// Show Model Details
function showModelDetails(modelName, descriptions) {
    const { summary, description } = getCompleteDescription(modelName, descriptions);
    document.getElementById('model-summary').textContent = summary;
    document.getElementById('model-description').value = description;
}

// Show Feedback Message
function showFeedbackMessage(message, isSuccess) {
    const feedbackMessage = document.getElementById('feedback-message');
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message';
    feedbackMessage.classList.add(isSuccess ? 'success' : 'error');
    feedbackMessage.style.display = 'block';

    setTimeout(() => {
        feedbackMessage.style.display = 'none';
    }, 3000);
}

// Send a message to the Ollama server and receive a response
async function sendMessage(message, modelName) {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName, text: message })
    });
    if (!response.ok) throw new Error('Failed to send message.');
    const data = await response.json();
    return data.responses;
}

// Add a message to the chat window
function addChatMessage(message, sender) {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle sending messages
document.getElementById('send-button').addEventListener('click', handleSendMessage);
document.getElementById('user-input').addEventListener('keypress', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
});

async function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect.value;

    if (!message) {
        showFeedbackMessage('Please enter a message.', false);
        return;
    }

    if (!selectedModel) {
        showFeedbackMessage('Please select a model.', false);
        return;
    }

    addChatMessage(message, 'user');
    userInput.value = '';

    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;

    try {
        const responses = await sendMessage(message, selectedModel);
        responses.forEach(response => addChatMessage(response, 'model'));
    } catch (error) {
        console.error('Failed to send message:', error);
        showFeedbackMessage('Failed to send message. Please try again.', false);
    } finally {
        sendButton.disabled = false;
    }
}

// Event listener for "Set as Default" button
document.getElementById('set-model-button').addEventListener('click', () => {
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect.value;
    if (selectedModel) {
        localStorage.setItem('defaultModel', selectedModel);
        showFeedbackMessage(`Model "${selectedModel}" has been set as the default model.`, true);
    } else {
        showFeedbackMessage('Please select a model to set as default.', false);
    }
});

// Event listener to show the model details
document.getElementById('model-select').addEventListener('change', event => {
    const selectedModel = event.target.value;
    showModelDetails(selectedModel, modelDescriptions);
});
