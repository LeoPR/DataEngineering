// modelSelection.js

import { showFeedbackMessage, addChatMessage } from './utils.js';
import { getCompleteDescription } from './description.js';

// Função para popular o dropdown de seleção de modelos
export function populateModelSelect(models, descriptions) {
    const modelSelect = document.getElementById('model-select');
    modelSelect.innerHTML = ''; // Limpa as opções existentes

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
            option.textContent = `${title} - ${model.name}`; // Exibe título e nome do modelo
            modelSelect.appendChild(option);
        } else {
            console.warn('Model is undefined or missing a name:', model);
        }
    });

    // Define o modelo padrão a partir do localStorage ou o primeiro modelo disponível
    const storedDefaultModel = localStorage.getItem('defaultModel') || (models.length ? models[0].name : '');
    modelSelect.value = storedDefaultModel || '';

    showModelDetails(modelSelect.value, descriptions);
}

// Função para exibir detalhes do modelo selecionado
export function showModelDetails(modelName, descriptions) {
    const { summary, description } = getCompleteDescription(modelName, descriptions);
    document.getElementById('model-summary').textContent = summary;
    document.getElementById('model-description').value = description;
}

// Listener para o botão "Set as Default"
document.getElementById('set-model-button').addEventListener('click', () => {
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect.value;
    if (selectedModel) {
        localStorage.setItem('defaultModel', selectedModel);
        showFeedbackMessage(`Modelo "${selectedModel}" foi definido como padrão.`, true);
    } else {
        showFeedbackMessage('Por favor, selecione um modelo para definir como padrão.', false);
    }
});
