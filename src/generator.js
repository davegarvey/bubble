/**
 * Get the default AI instructions for generating release notes
 * @returns {string} Default instructions
 */
export function getDefaultInstructions() {
    return `You are a professional technical writer that generates release notes from git commit data.

You will receive commit data wrapped in <commits> XML tags containing structured JSON.

Instructions:
- Analyze the commits in the <commits> section
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
 * @returns {Object} Object with {instructions, input}
 */
export function formatCommitsForAI(commits, options = {}) {
    const { customInstructions, instructionsExtension } = options;

    // Determine instructions
    let instructions;
    if (customInstructions) {
        instructions = customInstructions;
    } else {
        const defaultInstructions = getDefaultInstructions();
        instructions = instructionsExtension
            ? `${defaultInstructions}\n\n${instructionsExtension}`
            : defaultInstructions;
    }

    // Format commits as structured data with XML tags for clear data separation
    const commitData = commits.map(commit => ({
        subject: commit.subject,
        author: commit.author,
        hash: commit.hash.substring(0, 8),
        body: commit.body || null
    }));

    // Wrap data in XML tags for clear separation and referenceability
    const input = `<commits count="${commits.length}">
${JSON.stringify(commitData, null, 2)}
</commits>

Please analyze the commits above and generate professional release notes.`;

    return { instructions, input };
}

/**
 * Generate release notes using AI provider
 * @param {Array} commits - Array of commit objects
 * @param {AIProvider|Promise<AIProvider>} aiProvider - AI provider instance or promise
 * @param {Object} options - Customization options
 * @param {string} options.customInstructions - Custom instructions to replace the default entirely
 * @param {string} options.instructionsExtension - Additional instructions to append to default
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
