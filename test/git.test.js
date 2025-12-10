import { describe, it, expect } from 'vitest';

describe('git.js', () => {
    // Simplified tests that don't require complex mocking
    it('should export expected functions', async () => {
        const git = await import('../src/git.js');
        expect(typeof git.getCommitsSinceLastTag).toBe('function');
        expect(typeof git.tagExists).toBe('function');
        expect(typeof git.getRepoUrl).toBe('function');
    });
});