import { describe, it, expect, vi } from 'vitest';
import { formatCommitsForAI, generateReleaseNotes, generateSimpleReleaseNotes } from '../src/generator.js';

describe('generator.js', () => {
    describe('formatCommitsForAI', () => {
        it('should format commits with separate instructions and structured input', () => {
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

            const result = formatCommitsForAI(commits);

            // Check that it returns an object with instructions and input
            expect(result).toHaveProperty('instructions');
            expect(result).toHaveProperty('input');

            // Check instructions contain default guidelines
            expect(result.instructions).toContain('Group changes into logical categories');
            expect(result.instructions).toContain('Focus on user-facing changes');

            // Check input contains structured commit data with XML tags
            expect(result.input).toContain('<commits count="2">');
            expect(result.input).toContain('</commits>');
            expect(result.input).toContain('"subject": "feat: add new authentication system"');
            expect(result.input).toContain('"author": "John Doe"');
            expect(result.input).toContain('"hash": "abc123de"');
            expect(result.input).toContain('"subject": "fix: resolve memory leak in data processor"');
        });

        it('should extend default instructions with additional instructions', () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const result = formatCommitsForAI(commits, {
                instructionsExtension: '- Include emoji indicators\n- Mention database migrations'
            });

            expect(result.instructions).toContain('Group changes into logical categories');
            expect(result.instructions).toContain('- Include emoji indicators');
            expect(result.instructions).toContain('- Mention database migrations');
        });

        it('should replace default instructions with custom instructions', () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const customInstructions = 'Create brief bullet points of changes. Focus on breaking changes only.';
            const result = formatCommitsForAI(commits, { customInstructions });

            expect(result.instructions).toContain('Create brief bullet points of changes');
            expect(result.instructions).toContain('Focus on breaking changes only');
            expect(result.instructions).not.toContain('Group changes into logical categories');
        });

        it('should prioritize custom instructions over instructions extension', () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const customInstructions = 'Custom instructions here.';
            const result = formatCommitsForAI(commits, {
                customInstructions,
                instructionsExtension: 'This should be ignored'
            });

            expect(result.instructions).toContain('Custom instructions here');
            expect(result.instructions).not.toContain('This should be ignored');
            expect(result.instructions).not.toContain('Group changes into logical categories');
        });

        it('should include README content in input when provided', () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const readmeContent = '# My Project\n\nA developer-focused CLI tool for building awesome apps.';
            const result = formatCommitsForAI(commits, { readmeContent });

            // Check that README is wrapped in XML tags in the input
            expect(result.input).toContain('<readme>');
            expect(result.input).toContain('</readme>');
            expect(result.input).toContain('A developer-focused CLI tool');

            // Check that instructions mention README
            expect(result.instructions).toContain('Project README');

            // Check that final prompt mentions using the README context
            expect(result.input).toContain('taking into account the project context');
        });

        it('should not include README tags when readmeContent is not provided', () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const result = formatCommitsForAI(commits);

            // Check that README tags are not present
            expect(result.input).not.toContain('<readme>');
            expect(result.input).not.toContain('</readme>');
            expect(result.input).not.toContain('taking into account the project context');
        });

        it('should include commit diffs in input when provided', () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const commitDiffs = {
                'abc123def456': 'diff --git a/file.js b/file.js\n+ console.log("hello");'
            };
            const result = formatCommitsForAI(commits, { commitDiffs });

            // Check that diff is included in the commit object
            expect(result.input).toContain('diff --git a/file.js b/file.js');
            expect(result.input).toContain('console.log');
            expect(result.input).toContain('"diff":');

            // Check that there's no separate <diffs> section
            expect(result.input).not.toContain('<diffs>');

            // Check that instructions mention diffs in commits
            expect(result.instructions).toContain('each commit may include a diff field');

            // Check that final prompt mentions using the diffs
            expect(result.input).toContain('Use the diff data in each commit to better understand');
        });

        it('should not include diffs tags when commitDiffs is not provided', () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const result = formatCommitsForAI(commits);

            // Check that diff field is not in commit objects
            expect(result.input).not.toContain('"diff":');
            expect(result.input).not.toContain('Use the diff data');
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

        it('should generate release notes using AI provider with separated instructions and input', async () => {
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

            // Should be called with two arguments: instructions and input
            expect(mockProvider.generateText).toHaveBeenCalledTimes(1);
            const [instructions, input] = mockProvider.generateText.mock.calls[0];

            expect(instructions).toContain('Group changes into logical categories');
            expect(input).toContain('feat: add authentication');
            expect(input).toContain('abc123de');

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

        it('should pass custom instructions options to formatCommitsForAI', async () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const mockProvider = {
                generateText: vi.fn().mockResolvedValue('## Changes\n\n- Added feature')
            };

            const customInstructions = 'Create a simple list of changes.';
            await generateReleaseNotes(commits, mockProvider, { customInstructions });

            expect(mockProvider.generateText).toHaveBeenCalledTimes(1);
            const [instructions, input] = mockProvider.generateText.mock.calls[0];

            expect(instructions).toContain('Create a simple list of changes');
            expect(instructions).not.toContain('Group changes into logical categories');
        });

        it('should pass instructions extension options to formatCommitsForAI', async () => {
            const commits = [
                {
                    hash: 'abc123def456',
                    author: 'John Doe',
                    subject: 'feat: add feature',
                    body: ''
                }
            ];

            const mockProvider = {
                generateText: vi.fn().mockResolvedValue('## Changes\n\n- Added feature')
            };

            const instructionsExtension = '- Add emojis\n- Be concise';
            await generateReleaseNotes(commits, mockProvider, { instructionsExtension });

            expect(mockProvider.generateText).toHaveBeenCalledTimes(1);
            const [instructions, input] = mockProvider.generateText.mock.calls[0];

            expect(instructions).toContain('Add emojis');
            expect(instructions).toContain('Group changes into logical categories');
        });
    });
});