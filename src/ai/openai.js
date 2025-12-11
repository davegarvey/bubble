import OpenAI from 'openai';
import { AIProvider } from './provider.js';

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider extends AIProvider {
    constructor(config) {
        super(config);
        this.client = new OpenAI({
            apiKey: config.apiKey
        });
        this.model = config.model || 'gpt-5-mini';
    }

    async generateText(prompt) {
        try {
            const response = await this.client.responses.create({
                model: this.model,
                instructions: 'You are a helpful assistant that generates clear, concise, and well-structured release notes from git commit messages. Focus on user-facing changes and organize them into logical categories.',
                input: prompt
            });

            return response.output_text.trim();
        } catch (error) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    getName() {
        return 'OpenAI';
    }
}
