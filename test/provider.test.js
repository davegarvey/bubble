import { describe, it, expect, vi } from 'vitest';
import { AIProvider, getAIProvider } from '../src/ai/provider.js';

// Mock the OpenAI provider
vi.mock('../src/ai/openai.js', () => ({
  OpenAIProvider: vi.fn().mockImplementation((config) => ({
    generateText: vi.fn().mockResolvedValue('Mock AI response'),
    getName: vi.fn().mockReturnValue('OpenAI')
  }))
}));

describe('ai/provider.js', () => {
  describe('AIProvider', () => {
    it('should throw error for unimplemented methods', async () => {
      const provider = new AIProvider({});

      await expect(provider.generateText('test')).rejects.toThrow('generateText must be implemented by provider');
      expect(() => provider.getName()).toThrow('getName must be implemented by provider');
    });

    it('should store config in constructor', () => {
      const config = { apiKey: 'test-key' };
      const provider = new AIProvider(config);
      expect(provider.config).toBe(config);
    });
  });

  describe('getAIProvider', () => {
    it('should return OpenAI provider for openai name', async () => {
      const config = { apiKey: 'test-key' };
      const provider = await getAIProvider('openai', config);

      expect(provider.generateText).toBeDefined();
      expect(provider.getName()).toBe('OpenAI');
    });

    it('should return OpenAI provider for OPENAI name (case insensitive)', async () => {
      const config = { apiKey: 'test-key' };
      const provider = await getAIProvider('OPENAI', config);

      expect(provider.generateText).toBeDefined();
      expect(provider.getName()).toBe('OpenAI');
    });

    it('should throw error for unknown provider', () => {
      expect(() => getAIProvider('unknown', {})).toThrow('Unknown AI provider: unknown');
    });

    it('should include supported providers in error message', () => {
      expect(() => getAIProvider('anthropic', {})).toThrow('Supported providers: openai');
    });
  });
});