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
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that generates clear, concise, and well-structured release notes from git commit messages. Focus on user-facing changes and organize them into logical categories.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_completion_tokens: 2000
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    getName() {
        return 'OpenAI';
    }
}
