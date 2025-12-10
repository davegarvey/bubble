import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Get the previous tag before the specified tag
 * @param {string} currentTag - The current tag
 * @returns {Promise<string|null>} The previous tag or null if not found
 */
async function getPreviousTag(currentTag) {
    try {
        const { stdout } = await execAsync('git tag --sort=-version:refname');
        const tags = stdout.trim().split('\n').filter(t => t);

        const currentIndex = tags.indexOf(currentTag);
        if (currentIndex === -1 || currentIndex === tags.length - 1) {
            return null;
        }

        return tags[currentIndex + 1];
    } catch (error) {
        console.warn('Warning: Could not determine previous tag:', error.message);
        return null;
    }
}

/**
 * Get commits between two tags or since a specific tag
 * @param {string} currentTag - The current/new tag
 * @param {string|null} previousTag - The previous tag (optional)
 * @returns {Promise<Array>} Array of commit objects
 */
export async function getCommitsSinceLastTag(currentTag, previousTag = null) {
    try {
        // If no previous tag specified, try to find it
        if (!previousTag) {
            previousTag = await getPreviousTag(currentTag);
        }

        // Build git log command
        let range;
        if (previousTag) {
            range = `${previousTag}..${currentTag}`;
            console.log(`   Comparing ${previousTag} → ${currentTag}`);
        } else {
            // If still no previous tag, get all commits up to current tag
            range = currentTag;
            console.log(`   Getting all commits up to ${currentTag}`);
        }

        // Get commits with subject, body, author, and hash
        // Format: hash|author|date|subject|body
        const { stdout } = await execAsync(
            `git log ${range} --pretty=format:"%H|%an|%ai|%s|%b|||"`
        );

        if (!stdout.trim()) {
            return [];
        }

        // Parse commits
        const commits = stdout
            .split('|||')
            .filter(entry => entry.trim())
            .map(entry => {
                const [hash, author, date, subject, ...bodyParts] = entry.split('|');
                const body = bodyParts.join('|').trim();

                return {
                    hash: hash.trim(),
                    author: author.trim(),
                    date: date.trim(),
                    subject: subject.trim(),
                    body: body || ''
                };
            })
            .filter(commit => commit.hash); // Filter out any malformed entries

        return commits;
    } catch (error) {
        throw new Error(`Failed to get git commits: ${error.message}`);
    }
}

/**
 * Check if a tag exists
 * @param {string} tag - The tag to check
 * @returns {Promise<boolean>} True if tag exists
 */
export async function tagExists(tag) {
    try {
        await execAsync(`git rev-parse ${tag}`);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get the repository remote URL
 * @returns {Promise<string>} The remote URL
 */
export async function getRepoUrl() {
    try {
        const { stdout } = await execAsync('git config --get remote.origin.url');
        return stdout.trim();
    } catch (error) {
        throw new Error(`Failed to get repository URL: ${error.message}`);
    }
}
