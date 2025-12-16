/**
 * Get the base instructions that are always included (constant, technical context)
 * @returns {string} Base instructions
 */
export function getBaseInstructions() {
    return `You are a professional technical writer that generates release notes from git commit data.

You will receive:
- Project README wrapped in <readme> XML tags (if available) - use this to understand the project's audience, tone, and technical level
- Commit data wrapped in <commits> XML tags containing structured JSON

Instructions:`;
}

/**
 * Get the default style instructions (customizable guidelines)
 * @returns {string} Default style instructions
 */
export function getDefaultStyleInstructions() {
    return `- Analyze the commits in the <commits> section
- Group changes into logical categories (e.g., Features, Bug Fixes, Performance, Documentation, etc.)
- Focus on user-facing changes and impact
- Use clear, concise language
- Start each item with an action verb
- Omit internal/technical details that don't affect users
- Format the output in Markdown
- If there are breaking changes, highlight them in a separate section`;
}

/**
 * Format commits as structured input data and prepare instructions
 * @param {Array} commits - Array of commit objects
 * @param {Object} options - Customization options
 * @param {string} options.customInstructions - Custom instructions to replace the default entirely
 * @param {string} options.instructionsExtension - Additional instructions to append to default
 * @param {string} options.readmeContent - Optional README content for project context
 * @returns {Object} Object with {instructions, input}
 */
export function formatCommitsForAI(commits, options = {}) {
    const { customInstructions, instructionsExtension, readmeContent } = options;

    // Base instructions are always included (technical context)
    const baseInstructions = getBaseInstructions();

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
    const commitData = commits.map(commit => ({
        subject: commit.subject,
        author: commit.author,
        hash: commit.hash.substring(0, 8),
        body: commit.body || null
    }));

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
</commits>

Please analyze the commits above and generate professional release notes`;

    if (readmeContent) {
        input += `, taking into account the project context and target audience described in the README`;
    }

    input += '.';

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
 * @returns {Promise<string>} Generated release notes
 */
export async function generateReleaseNotes(commits, aiProvider, options = {}) {
    if (!commits || commits.length === 0) {
        return '## What\'s Changed\n\nNo changes in this release.';
    }

    // Handle async provider initialization
    const provider = await Promise.resolve(aiProvider);

    // Format commits and get instructions/input
    const { instructions, input } = formatCommitsForAI(commits, options);

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
