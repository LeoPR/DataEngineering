// app.js

async function fetchModels() {
    const OLLAMA_BASE_URL = CONFIG.OLLAMA_BASE_URL; // Base URL for the Ollama API
    const endpoint = "/api/tags"; // API endpoint

    try {
        const response = await fetch(`${OLLAMA_BASE_URL}${endpoint}`, {
            method: 'GET',
            //mode: 'no-cors' // Not recommended
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.models; // Return the array of models
    } catch (error) {
        console.error('Failed to fetch models:', error);
        return []; // Return an empty array on error
    }
}

// Populate the model selection dropdown
function populateModelSelect(models) {
    const modelSelect = document.getElementById('model-select');
    modelSelect.innerHTML = ''; // Clear existing options

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name; // Model name from API
        option.textContent = `${model.name} (${model.details.parameter_size})`; // Display model name and size
        modelSelect.appendChild(option);
    });
}

// Feedback message display
function showFeedbackMessage(message, isSuccess) {
    const feedbackMessage = document.getElementById('feedback-message');
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message'; // Reset classes
    feedbackMessage.classList.add(isSuccess ? 'success' : 'error');
    feedbackMessage.style.display = 'block';

    // Hide after 3 seconds
    setTimeout(() => {
        feedbackMessage.style.display = 'none';
    }, 3000);
}

// Setup event listeners
document.getElementById('set-model-button').addEventListener('click', () => {
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect.value;

    if (selectedModel) {
        localStorage.setItem('defaultModel', selectedModel); // Save to localStorage
        showFeedbackMessage(`Model "${selectedModel}" set as default.`, true);
    } else {
        showFeedbackMessage('Please select a model.', false);
    }
});

// Fetch and populate models on page load
fetchModels().then(models => {
    populateModelSelect(models);
}).catch(error => {
    console.error('Error fetching models:', error);
    showFeedbackMessage('Error loading models.', false);
});
