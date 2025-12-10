/**
 * Base AI Provider interface
 * Extend this class to add support for different AI providers
 */
export class AIProvider {
    constructor(config) {
        this.config = config;
    }

    /**
     * Generate release notes from commits
     * @param {string} prompt - The formatted prompt with commit information
     * @returns {Promise<string>} Generated release notes
     */
    async generateText(prompt) {
        throw new Error('generateText must be implemented by provider');
    }

    /**
     * Get the provider name
     * @returns {string} Provider name
     */
    getName() {
        throw new Error('getName must be implemented by provider');
    }
}

/**
 * Get an AI provider instance
 * @param {string} providerName - Name of the provider (openai, anthropic, etc.)
 * @param {Object} config - Provider configuration
 * @returns {AIProvider} Provider instance
 */
export function getAIProvider(providerName, config) {
    switch (providerName.toLowerCase()) {
        case 'openai':
            // Dynamic import to avoid loading unnecessary dependencies
            return import('./openai.js').then(module => new module.OpenAIProvider(config));

        // Add more providers here as needed
        // case 'anthropic':
        //   return import('./anthropic.js').then(module => new module.AnthropicProvider(config));

        default:
            throw new Error(`Unknown AI provider: ${providerName}. Supported providers: openai`);
    }
}
