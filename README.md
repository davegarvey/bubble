# Bubble - AI Release Notes Generator

Bubble is a Node.js CLI tool that generates releases and release notes using AI by analysing git commit messages. Perfect for automated release management in GitHub Actions workflows.

## Features

- 🤖 AI-powered release notes using OpenAI
- 🏷️ Automatically detects commits between tags
- 🚀 Works seamlessly in GitHub Actions
- 🎨 Generates clean, categorised Markdown

## Quick Start

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v4
      
      - name: Generate Release Notes
        run: |
          npx github:davegarvey/bubble \
            --latest \
            --repo ${{ github.repository }} \
            --github-token ${{ secrets.GITHUB_TOKEN }} \
            --api-key ${{ secrets.OPENAI_API_KEY }}
```

### With Custom Instructions

```yaml
      - name: Generate Release Notes with Custom Style
        run: |
          npx github:davegarvey/bubble \
            --latest \
            --repo ${{ github.repository }} \
            --github-token ${{ secrets.GITHUB_TOKEN }} \
            --api-key ${{ secrets.OPENAI_API_KEY }} \
            --instructions-extend "- Use emojis for each category
            - Highlight any security fixes in bold
            - Include upgrade instructions for breaking changes"
```

## Configuration

Add your OpenAI API key to GitHub Secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Add `OPENAI_API_KEY` with your OpenAI API key
3. Done! `GITHUB_TOKEN` is automatically available

> **Note**: When using `npx github:davegarvey/bubble` in GitHub Actions, the `GITHUB_TOKEN` may not be automatically detected. If you encounter authentication errors, explicitly set the token in your workflow's `env` section:
>
> ```yaml
> env:
>   GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
> ```

## Usage

1. Create a tag: `git tag v1.0.0 && git push --tags`
2. Go to Actions tab in your repository
3. Run "Release" workflow
4. Done! Check your releases page

## CLI Options

### Required Options

- `--latest` - Use the most recent tag (auto-detected)
- `--tag <tag>` - Specific Git tag to generate release notes for
- `--repo <repo>` - Repository in format `owner/repo` (or set `GITHUB_REPOSITORY` env var)
- `--api-key <key>` - API key for AI provider (or set `OPENAI_API_KEY` env var)

### Optional Options

- `--github-token <token>` - GitHub token for API access (or set `GITHUB_TOKEN` env var)
- `--dry-run` - Generate notes without creating release
- `--previous-tag <tag>` - Previous tag to compare against (auto-detected if not provided)
- `--provider <provider>` - AI provider to use (default: `openai`)
- `--model <model>` - AI model to use (default: `gpt-4-mini`)
- `--include-diffs` - Include git diffs for each commit to provide more context to AI
- `--include-readme` - Include README.md content for project context (default: true)

### Prompt Customization (CI/CD)

For CI/CD scenarios, you can customize the AI instructions:

- `--instructions <text>` - **Replace** the default instructions entirely with your custom instructions
- `--instructions-extend <text>` - **Extend** the default instructions by appending additional guidelines

**Examples:**

```bash
# Extend the default instructions with custom guidelines
npx github:davegarvey/bubble \
  --latest \
  --repo owner/repo \
  --github-token $GITHUB_TOKEN \
  --api-key $OPENAI_API_KEY \
  --instructions-extend "- Include emoji indicators for each category\n- Mention any database migrations"

# Replace the entire instructions with custom ones
npx github:davegarvey/bubble \
  --latest \
  --repo owner/repo \
  --github-token $GITHUB_TOKEN \
  --api-key $OPENAI_API_KEY \
  --instructions "You are a technical writer. Create brief release notes in bullet points. Focus only on breaking changes and new features."
```

**Default Behavior:** If neither option is specified, the tool uses its built-in default instructions unchanged.

**Architecture:** This tool uses OpenAI's Responses API with XML-tagged data for clear separation between instructions and commit information. See [Architecture Documentation](docs/adr/openai-responses-api-architecture.md) for details.

## Documentation

📚 **[Full Documentation](docs/README.md)**

- **Features**
  - [Instructions Customization](docs/features/instructions-customization.md) - Detailed examples for different use cases
  
- **Architecture Decision Records (ADRs)**
  - [ADR-001: XML-Tagged Data](docs/adr/ADR-001-xml-tagged-data.md) - Why we use XML tags
  - [OpenAI Responses API Architecture](docs/adr/openai-responses-api-architecture.md) - System design and best practices
  - [Instructions-Data Separation Implementation](docs/adr/instructions-data-separation-implementation.md) - Code changes and modifications

## Example Output

The AI generates well-structured release notes like:

```markdown
## 🎉 New Features

- Added user authentication with OAuth2 support
- Implemented dark mode toggle in settings

## 🐛 Bug Fixes

- Fixed memory leak in data processing pipeline
- Resolved race condition in concurrent requests

## 📚 Documentation

- Updated API documentation with new endpoints
- Added migration guide for v2.0

---

**Full Changelog**: 12 commit(s) from a1b2c3d4 to e5f6g7h8
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
