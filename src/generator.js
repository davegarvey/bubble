/**
 * Format commits into a structured prompt for AI
 * @param {Array} commits - Array of commit objects
 * @returns {string} Formatted prompt
 */
function formatCommitsForAI(commits) {
    let prompt = `Generate professional release notes from the following ${commits.length} commit(s). 

Instructions:
- Group changes into logical categories (e.g., Features, Bug Fixes, Performance, Documentation, etc.)
- Focus on user-facing changes and impact
- Use clear, concise language
- Start each item with an action verb
- Omit internal/technical details that don't affect users
- Format the output in Markdown
- If there are breaking changes, highlight them in a separate section

Commits:\n\n`;

    commits.forEach((commit, index) => {
        prompt += `${index + 1}. ${commit.subject}\n`;
        prompt += `   Author: ${commit.author}\n`;
        prompt += `   Hash: ${commit.hash.substring(0, 8)}\n`;

        if (commit.body) {
            // Clean up the commit body
            const cleanBody = commit.body
                .split('\n')
                .filter(line => line.trim())
                .join('\n   ');

            if (cleanBody) {
                prompt += `   Details: ${cleanBody}\n`;
            }
        }
        prompt += '\n';
    });

    prompt += '\nPlease generate the release notes now:';

    return prompt;
}

/**
 * Generate release notes using AI provider
 * @param {Array} commits - Array of commit objects
 * @param {AIProvider|Promise<AIProvider>} aiProvider - AI provider instance or promise
 * @returns {Promise<string>} Generated release notes
 */
export async function generateReleaseNotes(commits, aiProvider) {
    if (!commits || commits.length === 0) {
        return '## What\'s Changed\n\nNo changes in this release.';
    }

    // Handle async provider initialization
    const provider = await Promise.resolve(aiProvider);

    // Format commits into prompt
    const prompt = formatCommitsForAI(commits);

    // Generate release notes
    const releaseNotes = await provider.generateText(prompt);

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
