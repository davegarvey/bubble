/**
 * Get the base instructions that are always included (constant, technical context)
 * @param {Object} context - Context about what data is available
 * @param {boolean} context.hasReadme - Whether README content is provided
 * @param {boolean} context.hasDiffs - Whether commit diffs are provided
 * @returns {string} Base instructions
 */
export function getBaseInstructions(context = {}) {
    const { hasReadme = false, hasDiffs = false } = context;

    let instructions = `Role: You are a technical writer specializing in creating clear, user-focused release notes from git commits.

Task: Generate professional release notes from the provided git commits. Organize changes into meaningful categories and write descriptions that help users understand what changed and why it matters to them.

Only provide the release notes content in your output, without any additional commentary.

You will receive:`;

    if (hasReadme) {
        instructions += `
- Project README wrapped in <readme> XML tags - use this to understand the project's audience, tone, and technical level`;
    }

    instructions += `
- Commit data wrapped in <commits> XML tags containing structured JSON`;

    if (hasDiffs) {
        instructions += ` (each commit includes a diff field with code changes for deeper analysis)`;
    }

    instructions += `

Instructions:`;

    return instructions;
}

/**
 * Get the default style instructions (customizable guidelines)
 * @returns {string} Default style instructions
 */
export function getDefaultStyleInstructions() {
    return `## 1. Parse Conventional Commits Format
If commits follow the Conventional Commits format (e.g., \`feat:\`, \`fix:\`, \`docs:\`), use the commit type to guide categorization:
- \`feat:\` → New Features
- \`fix:\` → Bug Fixes
- \`perf:\` → Performance
- \`docs:\` → Documentation
- \`style:\` → (usually skip, unless user-visible styling changes)
- \`refactor:\` → (usually skip, unless impacts users)
- \`test:\` → (skip unless relevant context)
- \`chore:\` → (usually skip, unless affects users like dependency updates)
- \`build:\` / \`ci:\` → (skip unless relevant)
- \`BREAKING CHANGE:\` or \`!\` suffix → Breaking Changes

Extract the scope \`(scope)\` if present to add context (e.g., \`feat(auth): add SSO\` → mentions auth feature).

Use the commit description as a starting point, but rewrite for clarity and appropriate focus.

If commits don't follow conventions, infer categories from commit messages and code changes.

## 2. Categorization
Group commits into these categories (only include categories that have changes):
- **Breaking Changes**: Changes that may require action or break compatibility
- **New Features**: New functionality or capabilities
- **Improvements**: Enhancements to existing features
- **Bug Fixes**: Corrections to defects or issues
- **Performance**: Speed or efficiency improvements
- **Security**: Security-related updates
- **Documentation**: Documentation updates
- **Dependencies**: Library or dependency updates
- **Deprecations**: Features marked for future removal

## 3. Writing Style
- Infer the target audience (end users, developers, or mixed) from the nature of the project and commits, then adjust technical depth and terminology accordingly
- Start each item with an action verb (Added, Fixed, Improved, Updated, etc.)
- Focus on the *what* and *why*, not the *how*
- Be specific about what changed rather than vague descriptions
- Highlight user benefits when relevant

## 4. Filtering
- Merge related commits into single, coherent entries
- Skip trivial commits (typo fixes, formatting, minor refactoring) unless significant
- Combine similar changes (e.g., multiple bug fixes to the same feature)
- Omit internal-only changes that don't affect the target audience (tests, CI, internal refactoring unless relevant)
- Honor conventional commit types: skip \`chore\`, \`test\`, \`ci\`, \`build\` unless user-impacting

## 5. Breaking Changes
- Clearly mark breaking changes at the top or in their own prominent section
- Look for \`BREAKING CHANGE:\` in commit body or \`!\` after type/scope (e.g., \`feat!:\`)
- Explain what action is required to adapt to the change
- Provide migration guidance when applicable

## 6. Format
Use this structure:
\`\`\`
## [Version] - YYYY-MM-DD

### Breaking Changes
- Description of breaking change and required action

### New Features
- Feature description with benefit

### Improvements
- Enhancement description

### Bug Fixes
- Issue description and resolution

[Additional categories as needed]
\`\`\`

## 7. Quality Checks
- Ensure no duplicate entries
- Verify all significant user-facing changes are included
- Check that breaking changes are prominently displayed
- Confirm descriptions are understandable to non-developers
- Remove commit hashes, author names, and internal references unless specifically requested
- Validate that conventional commit types were correctly interpreted`;
}

/**
 * Prepare AI prompt with instructions and formatted commit data
 * @param {Array} commits - Array of commit objects
 * @param {Object} options - Customization options
 * @param {string} options.customInstructions - Custom instructions to replace the default entirely
 * @param {string} options.instructionsExtension - Additional instructions to append to default
 * @param {string} options.readmeContent - Optional README content for project context
 * @param {Object} options.commitDiffs - Optional mapping of commit hashes to their diffs
 * @returns {Object} Object with {instructions, input}
 */
export function prepareAIPrompt(commits, options = {}) {
    const { customInstructions, instructionsExtension, readmeContent, commitDiffs } = options;

    // Determine what data is available for context
    const hasReadme = !!readmeContent;
    const hasDiffs = !!(commitDiffs && Object.keys(commitDiffs).length > 0);

    // Base instructions are always included (technical context)
    const baseInstructions = getBaseInstructions({ hasReadme, hasDiffs });

    // Determine style instructions (customizable part)
    let styleInstructions;
    if (customInstructions) {
        // User provides complete replacement for style guidelines
        styleInstructions = customInstructions;
    } else {
        // Use default style instructions, optionally extended
        const defaultStyle = getDefaultStyleInstructions();
        styleInstructions = instructionsExtension
            ? `${defaultStyle}\n${instructionsExtension}`
            : defaultStyle;
    }

    // Combine base + style instructions
    const instructions = `${baseInstructions}\n${styleInstructions}`;

    // Format commits as structured data with XML tags for clear data separation
    const commitData = commits.map(commit => {
        const data = {
            subject: commit.subject,
            author: commit.author,
            hash: commit.hash.substring(0, 8),
            body: commit.body || null
        };

        // Add diff to commit object if available
        if (commitDiffs && commitDiffs[commit.hash]) {
            data.diff = commitDiffs[commit.hash];
        }

        return data;
    });

    // Build input data with optional README context
    let input = '';

    if (readmeContent) {
        input += `<readme>
${readmeContent}
</readme>

`;
    }

    input += `<commits count="${commits.length}">
${JSON.stringify(commitData, null, 2)}
</commits>`;

    return { instructions, input };
}

/**
 * Generate release notes using AI provider
 * @param {Array} commits - Array of commit objects
 * @param {AIProvider|Promise<AIProvider>} aiProvider - AI provider instance or promise
 * @param {Object} options - Customization options
 * @param {string} options.customInstructions - Custom instructions to replace the default entirely
 * @param {string} options.instructionsExtension - Additional instructions to append to default
 * @param {string} options.readmeContent - Optional README content for project context
 * @param {Object} options.commitDiffs - Optional mapping of commit hashes to their diffs
 * @returns {Promise<string>} Generated release notes
 */
export async function generateReleaseNotes(commits, aiProvider, options = {}) {
    if (!commits || commits.length === 0) {
        return '## What\'s Changed\n\nNo changes in this release.';
    }

    // Handle async provider initialization
    const provider = await Promise.resolve(aiProvider);

    // Format commits and get instructions/input
    const { instructions, input } = prepareAIPrompt(commits, options);

    // Generate release notes
    const releaseNotes = await provider.generateText(instructions, input);

    // Add metadata footer
    const footer = `\n\n---\n\n**Full Changelog**: ${commits.length} commit(s) from ${commits[commits.length - 1].hash.substring(0, 8)} to ${commits[0].hash.substring(0, 8)}`;

    return releaseNotes + footer;
}

/**
 * Create a simple fallback release notes without AI
 * Useful for debugging or when AI is not available
 * @param {Array} commits - Array of commit objects
 * @returns {string} Simple release notes
 */
export function generateSimpleReleaseNotes(commits) {
    if (!commits || commits.length === 0) {
        return '## What\'s Changed\n\nNo changes in this release.';
    }

    let notes = '## What\'s Changed\n\n';

    commits.forEach(commit => {
        notes += `- ${commit.subject} (${commit.hash.substring(0, 8)})\n`;
    });

    return notes;
}
