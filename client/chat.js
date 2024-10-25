// chat.js

import { OLLAMA_BASE_URL } from './config.js';
import { showFeedbackMessage, addChatMessage, addChatButton } from './utils.js';

// Configurações de timeout baseadas nos modelos (em milissegundos)
const TIMEOUT_CONFIG = {
    "llama3.2": {
        wakeUp: 115 * 1000, // 115 segundos
        response: 5 * 1000   // 5 segundos
    },
    "llama3.2:1b": {
        wakeUp: 115 * 1000, // Mesmo que llama3.2 para este exemplo
        response: 5 * 1000
    },
    "codellama": {
        wakeUp: 60 * 1000,  // Exemplo: 60 segundos
        response: 4 * 1000
    },
    "llama2-uncensored": {
        wakeUp: 60 * 1000,
        response: 4 * 1000
    },
    "llama3.2portugues": {
        wakeUp: 80 * 1000,  // Exemplo: 80 segundos
        response: 6 * 1000
    },
    // Adicione mais modelos e seus valores de timeout conforme necessário
};

// Função para gerenciar o envio de mensagens
export async function handleSendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect.value;

    if (!message) {
        showFeedbackMessage('Por favor, insira uma mensagem.', false);
        return;
    }

    if (!selectedModel) {
        showFeedbackMessage('Por favor, selecione um modelo.', false);
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
        showFeedbackMessage('Falha ao enviar a mensagem. Por favor, tente novamente.', false);
    } finally {
        sendButton.disabled = false;
    }
}

// Função para enviar mensagem à API
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

    // Obtém os timeouts para o modelo selecionado
    const modelTimeouts = TIMEOUT_CONFIG[modelName] || { wakeUp: 10000, response: 5000 }; // Padrão: 10s e 5s se não encontrado
    const { wakeUp, response: responseTimeout } = modelTimeouts;

    // Função para realizar fetch com timeout
    const fetchWithTimeout = (url, options, timeout) => {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
        ]);
    };

    try {
        // Exibe mensagem de espera
        const waitingMessage = "Aguardando o modelo acordar...";
        addChatMessage(waitingMessage, 'system');

        // Simula o tempo de wake-up
        console.log(`Esperando o modelo acordar por ${wakeUp} ms...`);
        await new Promise((resolve) => setTimeout(resolve, wakeUp));

        // Faz a chamada à API com timeout
        console.log(`Enviando requisição para ${OLLAMA_BASE_URL}/v1/chat/completions com body:`, requestBody);
        const apiResponse = await fetchWithTimeout(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }, responseTimeout);

        if (!apiResponse.ok) {
            throw new Error(`Error: ${apiResponse.status} ${apiResponse.statusText}`);
        }

        const data = await apiResponse.json();

        // Extrai a mensagem do assistente da resposta
        const assistantMessage = data.choices[0]?.message?.content || "Nenhuma resposta do assistente.";
        return [assistantMessage]; // Retorna a resposta em formato de array
    } catch (error) {
        console.error('Failed to send message:', error);
        // Adiciona mensagem de erro com botão de retry
        const retryMessage = "Erro de tempo limite. Clique para tentar novamente.";
        addChatMessage(retryMessage, 'error');

        // Cria o botão de retry
        const retryButton = document.createElement('button');
        retryButton.textContent = "Retry";
        retryButton.classList.add('retry-button'); // Adicione uma classe para estilização
        retryButton.onclick = () => {
            document.getElementById('user-input').value = message; // Define a mensagem no campo de entrada
            handleSendMessage(); // Reativa o envio da mensagem
        };

        // Adiciona o botão de retry ao chat
        addChatButton(retryButton);

        showFeedbackMessage('Falha ao enviar a mensagem. Por favor, tente novamente.', false);
        return []; // Retorna um array vazio em caso de erro
    }
}
