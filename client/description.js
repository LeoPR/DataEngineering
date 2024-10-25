// description.js

export function getCompleteDescription(modelName, descriptions) {
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
