import { describe, it, expect, vi } from 'vitest';
import { formatCommitsForAI, generateReleaseNotes, generateSimpleReleaseNotes } from '../src/generator.js';

describe('generator.js', () => {
  describe('formatCommitsForAI', () => {
    it('should format commits into a proper AI prompt', () => {
      const commits = [
        {
          hash: 'abc123def456',
          author: 'John Doe',
          subject: 'feat: add new authentication system',
          body: 'This implements OAuth2 login\nwith support for Google and GitHub'
        },
        {
          hash: 'def456ghi789',
          author: 'Jane Smith',
          subject: 'fix: resolve memory leak in data processor',
          body: ''
        }
      ];

      const prompt = formatCommitsForAI(commits);

      expect(prompt).toContain('Generate professional release notes from the following 2 commit(s)');
      expect(prompt).toContain('1. feat: add new authentication system');
      expect(prompt).toContain('Author: John Doe');
      expect(prompt).toContain('Hash: abc123de');
      expect(prompt).toContain('Details: This implements OAuth2 login');
      expect(prompt).toContain('2. fix: resolve memory leak in data processor');
      expect(prompt).toContain('Author: Jane Smith');
      expect(prompt).toContain('Hash: def456gh');
    });
  });

  describe('generateSimpleReleaseNotes', () => {
    it('should generate simple release notes without AI', () => {
      const commits = [
        {
          hash: 'abc123def456',
          author: 'John Doe',
          subject: 'feat: add new authentication system',
          body: ''
        },
        {
          hash: 'def456ghi789',
          author: 'Jane Smith',
          subject: 'fix: resolve memory leak',
          body: ''
        }
      ];

      const notes = generateSimpleReleaseNotes(commits);

      expect(notes).toContain("## What's Changed");
      expect(notes).toContain('- feat: add new authentication system (abc123de)');
      expect(notes).toContain('- fix: resolve memory leak (def456gh)');
    });

    it('should handle empty commits array', () => {
      const notes = generateSimpleReleaseNotes([]);
      expect(notes).toBe("## What's Changed\n\nNo changes in this release.");
    });

    it('should handle null/undefined commits', () => {
      const notes = generateSimpleReleaseNotes(null);
      expect(notes).toBe("## What's Changed\n\nNo changes in this release.");
    });
  });

  describe('generateReleaseNotes', () => {
    it('should handle empty commits array', async () => {
      const mockProvider = {
        generateText: vi.fn()
      };

      const notes = await generateReleaseNotes([], mockProvider);
      expect(notes).toBe("## What's Changed\n\nNo changes in this release.");
      expect(mockProvider.generateText).not.toHaveBeenCalled();
    });

    it('should generate release notes using AI provider', async () => {
      const commits = [
        {
          hash: 'abc123def456',
          author: 'John Doe',
          subject: 'feat: add authentication',
          body: ''
        }
      ];

      const mockProvider = {
        generateText: vi.fn().mockResolvedValue('## Features\n\n- Added authentication system')
      };

      const notes = await generateReleaseNotes(commits, mockProvider);

      expect(mockProvider.generateText).toHaveBeenCalledWith(expect.stringContaining('feat: add authentication'));
      expect(notes).toContain('## Features');
      expect(notes).toContain('Added authentication system');
      expect(notes).toContain('**Full Changelog**: 1 commit(s) from abc123de to abc123de');
    });

    it('should handle async AI provider', async () => {
      const commits = [
        {
          hash: 'abc123def456',
          author: 'John Doe',
          subject: 'feat: add authentication',
          body: ''
        }
      ];

      const mockProviderPromise = Promise.resolve({
        generateText: vi.fn().mockResolvedValue('## Features\n\n- Added authentication system')
      });

      const notes = await generateReleaseNotes(commits, mockProviderPromise);

      expect(notes).toContain('## Features');
      expect(notes).toContain('Added authentication system');
    });
  });
});