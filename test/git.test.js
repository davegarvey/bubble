import { describe, it, expect, vi } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock child_process
vi.mock('child_process', () => ({
    exec: vi.fn()
}));

const execAsync = promisify(exec);

describe('git.js', () => {
    it('should export expected functions', async () => {
        const git = await import('../src/git.js');
        expect(typeof git.getCommitsSinceLastTag).toBe('function');
        expect(typeof git.tagExists).toBe('function');
        expect(typeof git.getRepoUrl).toBe('function');
    });

    describe('getCommitsSinceLastTag', () => {
        it('should parse commits with no body correctly', async () => {
            // Mock git output with empty body (creates ||||)
            const mockOutput = 'abc123|John Doe|2025-12-15 10:00:00 +0000|feat: add feature||||';

            vi.mocked(exec).mockImplementation((cmd, callback) => {
                callback(null, { stdout: mockOutput, stderr: '' });
            });

            const { getCommitsSinceLastTag } = await import('../src/git.js');
            const commits = await getCommitsSinceLastTag('v1.0.0', 'v0.9.0');

            expect(commits).toHaveLength(1);
            expect(commits[0]).toEqual({
                hash: 'abc123',
                author: 'John Doe',
                date: '2025-12-15 10:00:00 +0000',
                subject: 'feat: add feature',
                body: ''
            });
        });

        it('should parse commits with body correctly', async () => {
            // Mock git output with body content
            const mockOutput = 'def456|Jane Smith|2025-12-15 11:00:00 +0000|fix: fix bug|This is the body content|||';

            vi.mocked(exec).mockImplementation((cmd, callback) => {
                callback(null, { stdout: mockOutput, stderr: '' });
            });

            const { getCommitsSinceLastTag } = await import('../src/git.js');
            const commits = await getCommitsSinceLastTag('v1.0.0', 'v0.9.0');

            expect(commits).toHaveLength(1);
            expect(commits[0]).toEqual({
                hash: 'def456',
                author: 'Jane Smith',
                date: '2025-12-15 11:00:00 +0000',
                subject: 'fix: fix bug',
                body: 'This is the body content'
            });
        });

        it('should parse multiple commits with mixed body presence', async () => {
            // Real-world scenario: mix of commits with and without bodies
            const mockOutput = `abc123|John Doe|2025-12-15 10:00:00 +0000|feat: add feature||||
def456|Jane Smith|2025-12-15 11:00:00 +0000|fix: fix bug|Body with details|||
ghi789|Bob Jones|2025-12-15 12:00:00 +0000|docs: update README||||
jkl012|Alice Brown|2025-12-15 13:00:00 +0000|chore: bump version||||`;

            vi.mocked(exec).mockImplementation((cmd, callback) => {
                callback(null, { stdout: mockOutput, stderr: '' });
            });

            const { getCommitsSinceLastTag } = await import('../src/git.js');
            const commits = await getCommitsSinceLastTag('v1.0.0', 'v0.9.0');

            expect(commits).toHaveLength(4);
            expect(commits[0].hash).toBe('abc123');
            expect(commits[0].body).toBe('');
            expect(commits[1].hash).toBe('def456');
            expect(commits[1].body).toBe('Body with details');
            expect(commits[2].hash).toBe('ghi789');
            expect(commits[2].body).toBe('');
            expect(commits[3].hash).toBe('jkl012');
            expect(commits[3].body).toBe('');
        });

        it('should handle empty git output', async () => {
            vi.mocked(exec).mockImplementation((cmd, callback) => {
                callback(null, { stdout: '', stderr: '' });
            });

            const { getCommitsSinceLastTag } = await import('../src/git.js');
            const commits = await getCommitsSinceLastTag('v1.0.0', 'v0.9.0');

            expect(commits).toHaveLength(0);
        });

        it('should handle undefined stdout', async () => {
            vi.mocked(exec).mockImplementation((cmd, callback) => {
                callback(null, { stdout: undefined, stderr: '' });
            });

            const { getCommitsSinceLastTag } = await import('../src/git.js');
            const commits = await getCommitsSinceLastTag('v1.0.0', 'v0.9.0');

            expect(commits).toHaveLength(0);
        });

        it('should handle body with pipe characters', async () => {
            // Body content that includes pipe characters
            const mockOutput = 'abc123|John Doe|2025-12-15 10:00:00 +0000|feat: add feature|This | has | pipes|||';

            vi.mocked(exec).mockImplementation((cmd, callback) => {
                callback(null, { stdout: mockOutput, stderr: '' });
            });

            const { getCommitsSinceLastTag } = await import('../src/git.js');
            const commits = await getCommitsSinceLastTag('v1.0.0', 'v0.9.0');

            expect(commits).toHaveLength(1);
            expect(commits[0].body).toBe('This | has | pipes');
        });
    });
});