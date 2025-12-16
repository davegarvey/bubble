#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { getCommitsSinceLastTag, getDiffsSinceLastTag } from '../src/git.js';
import { generateReleaseNotes } from '../src/generator.js';
import { createOrUpdateRelease } from '../src/github.js';
import { getAIProvider } from '../src/ai/provider.js';

dotenv.config();

const program = new Command();

program
    .name('ai-release-notes')
    .description('Generate AI-powered release notes for GitHub releases')
    .version('1.0.0')
    .option('-t, --tag <tag>', 'Git tag to generate release notes for')
    .option('-l, --latest', 'Use the most recent tag (auto-detected)', false)
    .option('-r, --repo <repo>', 'Repository in format owner/repo', process.env.GITHUB_REPOSITORY)
    .option('-p, --provider <provider>', 'AI provider to use (openai, anthropic, etc.)', 'openai')
    .option('--api-key <key>', 'API key for AI provider', process.env.OPENAI_API_KEY)
    .option('--model <model>', 'AI model to use', process.env.OPENAI_MODEL || 'gpt-5-mini')
    .option('--github-token <token>', 'GitHub token for API access', process.env.GITHUB_TOKEN)
    .option('--dry-run', 'Generate notes without creating release', false)
    .option('--previous-tag <tag>', 'Previous tag to compare against (auto-detected if not provided)')
    .option('--instructions <text>', 'Custom instructions to replace the default instructions entirely')
    .option('--instructions-extend <text>', 'Additional instructions to append to the default instructions')
    .option('--include-diffs', 'Include git diffs for each commit to provide more context to AI', false)
    .parse(process.argv);

const options = program.opts();

async function main() {
    try {
        console.log('🚀 Starting AI Release Notes Generator...\n');

        // Validate required inputs
        if (!options.repo) {
            throw new Error('Repository must be specified via --repo or GITHUB_REPOSITORY env var');
        }

        if (!options.apiKey) {
            throw new Error(`API key must be provided via --api-key or OPENAI_API_KEY env var`);
        }

        if (!options.dryRun && !options.githubToken) {
            throw new Error('GitHub token must be provided via --github-token or GITHUB_TOKEN env var');
        }

        // Determine which tag to use
        let tag = options.tag;
        if (options.latest) {
            const { execSync } = await import('child_process');
            tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
            console.log(`🔍 Auto-detected latest tag: ${tag}\n`);
        }

        if (!tag) {
            throw new Error('Either --tag or --latest must be specified');
        }

        // Get commits since last tag
        console.log(`📝 Fetching commits for tag: ${tag}...`);
        const commits = await getCommitsSinceLastTag(tag, options.previousTag);

        if (commits.length === 0) {
            console.log('⚠️  No commits found since last tag');
            return;
        }

        console.log(`   Found ${commits.length} commits\n`);

        // Get diffs for commits if requested (optional)
        let commitDiffs = null;
        if (options.includeDiffs) {
            console.log('📋 Fetching commit diffs for additional context...');
            commitDiffs = await getDiffsSinceLastTag(tag, options.previousTag);
            const diffCount = Object.keys(commitDiffs).length;
            console.log(`   Found diffs for ${diffCount} commits\n`);
        }

        // Read README for project context (optional)
        let readmeContent = null;
        try {
            const { readFileSync } = await import('fs');
            readmeContent = readFileSync('README.md', 'utf-8');
            console.log('📖 Found README.md for project context\n');
        } catch (error) {
            // README not found or not readable - continue without it
            console.log('ℹ️  No README.md found, continuing without project context\n');
        }

        // Initialize AI provider
        const aiProvider = getAIProvider(options.provider, {
            apiKey: options.apiKey,
            model: options.model
        });

        // Generate release notes
        console.log('🤖 Generating release notes with AI...');
        const releaseNotes = await generateReleaseNotes(commits, aiProvider, {
            customInstructions: options.instructions,
            instructionsExtension: options.instructionsExtend,
            readmeContent: readmeContent,
            commitDiffs: commitDiffs
        });

        console.log('\n' + '='.repeat(80));
        console.log('Generated Release Notes:');
        console.log('='.repeat(80));
        console.log(releaseNotes);
        console.log('='.repeat(80) + '\n');

        // Create or update GitHub release
        if (options.dryRun) {
            console.log('✅ Dry run complete - no release created');
        } else {
            console.log('📦 Creating GitHub release...');
            const [owner, repo] = options.repo.split('/');
            await createOrUpdateRelease({
                owner,
                repo,
                tag,
                body: releaseNotes,
                token: options.githubToken
            });
            console.log('✅ Release created successfully!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
