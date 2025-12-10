import { Octokit } from '@octokit/rest';

/**
 * Create or update a GitHub release
 * @param {Object} options - Release options
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {string} options.tag - Tag name
 * @param {string} options.body - Release notes body
 * @param {string} options.token - GitHub token
 * @param {string} options.name - Release name (optional, defaults to tag)
 * @param {boolean} options.draft - Whether release is a draft (default: false)
 * @param {boolean} options.prerelease - Whether release is a prerelease (default: auto-detect)
 * @returns {Promise<Object>} Created/updated release
 */
export async function createOrUpdateRelease(options) {
    const {
        owner,
        repo,
        tag,
        body,
        token,
        name = tag,
        draft = false,
        prerelease = null
    } = options;

    // Initialize Octokit
    const octokit = new Octokit({
        auth: token
    });

    // Auto-detect prerelease from tag name
    const isPrerelease = prerelease !== null
        ? prerelease
        : /-(alpha|beta|rc|pre)/i.test(tag);

    try {
        // Check if release already exists
        let existingRelease;
        try {
            const { data } = await octokit.rest.repos.getReleaseByTag({
                owner,
                repo,
                tag
            });
            existingRelease = data;
        } catch (error) {
            if (error.status !== 404) {
                throw error;
            }
            // Release doesn't exist, which is fine
        }

        if (existingRelease) {
            // Update existing release
            console.log(`   Updating existing release for ${tag}...`);
            const { data } = await octokit.rest.repos.updateRelease({
                owner,
                repo,
                release_id: existingRelease.id,
                tag_name: tag,
                name,
                body,
                draft,
                prerelease: isPrerelease
            });

            return data;
        } else {
            // Create new release
            console.log(`   Creating new release for ${tag}...`);
            const { data } = await octokit.rest.repos.createRelease({
                owner,
                repo,
                tag_name: tag,
                name,
                body,
                draft,
                prerelease: isPrerelease
            });

            return data;
        }
    } catch (error) {
        throw new Error(`Failed to create/update GitHub release: ${error.message}`);
    }
}

/**
 * Get an existing release by tag
 * @param {Object} options - Options
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {string} options.tag - Tag name
 * @param {string} options.token - GitHub token
 * @returns {Promise<Object|null>} Release object or null if not found
 */
export async function getRelease(options) {
    const { owner, repo, tag, token } = options;

    const octokit = new Octokit({
        auth: token
    });

    try {
        const { data } = await octokit.rest.repos.getReleaseByTag({
            owner,
            repo,
            tag
        });
        return data;
    } catch (error) {
        if (error.status === 404) {
            return null;
        }
        throw new Error(`Failed to get GitHub release: ${error.message}`);
    }
}

/**
 * List releases for a repository
 * @param {Object} options - Options
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {string} options.token - GitHub token
 * @param {number} options.perPage - Number of releases per page (default: 30)
 * @returns {Promise<Array>} Array of releases
 */
export async function listReleases(options) {
    const { owner, repo, token, perPage = 30 } = options;

    const octokit = new Octokit({
        auth: token
    });

    try {
        const { data } = await octokit.rest.repos.listReleases({
            owner,
            repo,
            per_page: perPage
        });
        return data;
    } catch (error) {
        throw new Error(`Failed to list GitHub releases: ${error.message}`);
    }
}
