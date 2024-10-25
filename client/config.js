// config.js

window.CONFIG = {
    OLLAMA_BASE_URL: window.location.hostname === 'localhost' ? "http://localhost:11434" : "http://ollama:11434",
    TIMEOUT: 5000, // Request timeout in milliseconds
    DEBUG_MODE: false // Toggle debug logging
};
