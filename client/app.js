// app.js

import { OLLAMA_BASE_URL } from './config.js'; // Importar OLLAMA_BASE_URL
import { populateModelSelect, showModelDetails } from './modelSelection.js';
import { handleSendMessage } from './chat.js';
import { showFeedbackMessage } from './utils.js'; // Importar para uso no init

// Variáveis globais
let modelDescriptions = {};

// Inicialização do aplicativo
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
        showFeedbackMessage('Erro ao inicializar o aplicativo.', false);
    }
}

// Função para buscar os modelos da API
async function fetchModels() {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`); // Certifique-se de que a URL está correta
    if (!response.ok) throw new Error('Falha ao buscar os modelos.');
    const data = await response.json();
    return data.models;
}

// Função para buscar as descrições dos modelos
async function fetchModelDescriptions() {
    const response = await fetch('models_descriptions.json');
    if (!response.ok) throw new Error('Falha ao buscar as descrições dos modelos.');
    const data = await response.json();
    return data.models;
}
