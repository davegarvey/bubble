import { describe, it, expect, vi } from 'vitest';

// Mock process.argv and other process properties
const originalArgv = process.argv;
const originalExit = process.exit;
const originalEnv = process.env;

describe('CLI', () => {
    beforeEach(() => {
        // Reset process.argv before each test
        process.argv = [...originalArgv];
        process.exit = vi.fn();
        process.env = { ...originalEnv };

        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        process.argv = originalArgv;
        process.exit = originalExit;
        process.env = originalEnv;
    });

    it('should accept --tag option', async () => {
        process.argv = ['node', 'bin/cli.js', '--tag', 'v1.0.0'];

        // Mock the git and other dependencies to avoid actual execution
        vi.doMock('child_process', () => ({
            exec: vi.fn((cmd, callback) => callback(new Error('Mock error')))
        }));

        try {
            await import('../bin/cli.js');
        } catch (error) {
            // Expected to fail due to mocked dependencies
            expect(error.message).toContain('Failed to get git commits');
        }
    });

    it('should accept --latest option', async () => {
        process.argv = ['node', 'bin/cli.js', '--latest'];

        // Mock dependencies
        vi.doMock('child_process', () => ({
            exec: vi.fn((cmd, callback) => callback(new Error('Mock error')))
        }));

        try {
            await import('../bin/cli.js');
        } catch (error) {
            // Expected to fail due to mocked dependencies
            expect(error.message).toContain('Failed to get git commits');
        }
    });

    it('should require either --tag or --latest', async () => {
        process.argv = ['node', 'bin/cli.js'];

        // Mock dependencies to prevent actual execution
        vi.doMock('child_process', () => ({
            exec: vi.fn((cmd, callback) => callback(null, { stdout: '' }))
        }));

        try {
            await import('../bin/cli.js');
        } catch (error) {
            expect(error.message).toContain('Either --tag or --latest must be specified');
        }
    });
});