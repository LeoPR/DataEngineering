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
// Timeout configurations based on models (in milliseconds)
const TIMEOUT_CONFIG = {
    "llama3.2": {
        wakeUp: 115 * 1000, // 115 seconds
        response: 5 * 1000   // 5 seconds
    },
    "llama3.2:1b": {
        wakeUp: 115 * 1000, // Same as llama3.2 for this example
        response: 5 * 1000
    },
    "codellama": {
        wakeUp: 60 * 1000,  // Example: 60 seconds
        response: 4 * 1000
    },
    "llama2-uncensored": {
        wakeUp: 60 * 1000,
        response: 4 * 1000
    },
    "llama3.2portugues": {
        wakeUp: 80 * 1000,  // Example: 80 seconds
        response: 6 * 1000
    },
    // Add more models and their timeout values as needed
};

// Fetch Models
async function fetchModels() {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) throw new Error('Failed to fetch models.');
    const data = await response.json();
    return data.models;
}

// Fetch Model Descriptions
async function fetchModelDescriptions() {
    const response = await fetch('models_descriptions.json');
    if (!response.ok) throw new Error('Failed to fetch model descriptions.');
    const data = await response.json();
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

    // Set the default model from localStorage or the first available model
    const storedDefaultModel = localStorage.getItem('defaultModel') || (models.length ? models[0].name : '');
    modelSelect.value = storedDefaultModel || '';

    showModelDetails(modelSelect.value, descriptions);
}

// Simplified Get Complete Description
function getCompleteDescription(modelName, descriptions) {
    if (!descriptions) {
        return { title: modelName, summary: '', description: '' };
    }

    const userLanguage = navigator.language || navigator.userLanguage; // e.g., "en-US", "pt-BR"
    const languageCode = userLanguage.includes('pt') ? 'pt-br' : 'en-us'; // Default to 'pt-br' if in Portuguese

    let modelDesc = descriptions[modelName];

    if (!modelDesc) {
        const baseModelName = modelName.split(':')[0];
        modelDesc = descriptions[baseModelName];
    }

    if (!modelDesc) {
        return { title: modelName, summary: '', description: '' };
    }

    const title = modelDesc.title[languageCode] || modelDesc.title['en-us'] || modelName;
    const summary = modelDesc.summary[languageCode] || modelDesc.summary['en-us'] || '';
    const description = modelDesc.description[languageCode] || modelDesc.description['en-us'] || '';

    return {
        title,
        summary,
        description
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

// Enhanced Send Message Function
// Enhanced Send Message Function with Timeout
async function sendMessage(message, modelName) {
    const systemMessage = {
        role: "system",
        content: "Responda em portugues, com frases curtas."
    };

    const userMessage = {
        role: "user",
        content: message
    };

    const requestBody = {
        model: modelName,
        messages: [systemMessage, userMessage]
    };

    // Get the timeouts for the selected model
    const { wakeUp, response } = TIMEOUT_CONFIG[modelName] || { wakeUp: 10000, response: 5000 }; // Default to 10s and 5s if not found

    const fetchWithTimeout = (url, options, timeout) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
        ]);
    };

    try {
        // Wake up the model (simulated with timeout)
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, wakeUp);
        });

        // Now make the fetch call
        const response = await fetchWithTimeout(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }, response);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract the assistant's message from the response
        const assistantMessage = data.choices[0]?.message?.content || "No response from the assistant.";
        return [assistantMessage]; // Return the response in an array format
    } catch (error) {
        console.error('Failed to send message:', error);
        showFeedbackMessage('Failed to send message. Please try again.', false);
        return []; // Return an empty array on error
    }
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
