// app.js

async function fetchModels() {
    const OLLAMA_BASE_URL = CONFIG.OLLAMA_BASE_URL; // Base URL for the Ollama API
    const endpoint = "/api/tags"; // API endpoint

    try {
        const response = await fetch(`${OLLAMA_BASE_URL}${endpoint}`);
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

async function fetchModelDescriptions() {
    try {
        const response = await fetch('models_descriptions.json'); // Fetch model descriptions
        if (!response.ok) {
            throw new Error(`Error fetching model descriptions: ${response.statusText}`);
        }
        const data = await response.json();
        return data.models; // Return the descriptions
    } catch (error) {
        console.error(error);
        return {}; // Return an empty object on error
    }
}

// Get the complete description, inheriting from parent if necessary
// Get the complete description, inheriting from parent if necessary
function getCompleteDescription(modelName, descriptions) {
    let model = descriptions[modelName];

    if (!model) {
        // If the model doesn't exist in descriptions, return a fallback
        return {
            title: modelName, // Fallback to the model name
            description: 'No description available.'
        };
    }

    // Get title and description, falling back to inheritance
    let completeTitle = model.title || (model.inherits ? descriptions[model.inherits]?.title : '');
    let completeDescription = model.description || (model.inherits ? descriptions[model.inherits]?.description : '');

    return {
        title: completeTitle,
        description: completeDescription
    };
}


// Populate the model selection dropdown
function populateModelSelect(models, descriptions) {
    const modelSelect = document.getElementById('model-select');
    modelSelect.innerHTML = ''; // Clear existing options

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name; // Model name from API

        const { title } = getCompleteDescription(model.name, descriptions); // Get title
        option.textContent = `${model.name} - ${title}`; // Show model name with title
        modelSelect.appendChild(option);
    });

    // Set the default model from localStorage or fallback to a default
    const lastUsedModel = localStorage.getItem('defaultModel') || 'codellama:13b'; // Default model
    if (models.some(model => model.name === lastUsedModel)) {
        modelSelect.value = lastUsedModel; // Set the stored model if it exists
    } else {
        modelSelect.value = 'codellama:13b'; // Fallback default model
        showFeedbackMessage(`Model "${lastUsedModel}" not found. Using fallback: "codellama:13b".`, false);
    }
}


// Show model description in a text area
function showModelDescription(modelName, descriptions) {
    const descriptionTextArea = document.getElementById('model-description');
    const { description } = getCompleteDescription(modelName, descriptions);
    descriptionTextArea.value = description; // Set the text area to show the model description
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

// Event listener to show the model description
document.getElementById('model-select').addEventListener('change', (event) => {
    const selectedModel = event.target.value;
    showModelDescription(selectedModel, modelDescriptions);
});

// Fetch and populate models on page load
let modelDescriptions = {};
Promise.all([fetchModels(), fetchModelDescriptions()]).then(([models, descriptions]) => {
    modelDescriptions = descriptions; // Store descriptions globally
    populateModelSelect(models, descriptions);
}).catch(error => {
    console.error('Error fetching models:', error);
    showFeedbackMessage('Error loading models.', false);
});
