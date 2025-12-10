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

## Configuration

Add your OpenAI API key to GitHub Secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Add `OPENAI_API_KEY` with your OpenAI API key
3. Done! `GITHUB_TOKEN` is automatically available

> **Note**: When using `npx github:davegarvey/bubble` in GitHub Actions, the `GITHUB_TOKEN` may not be automatically detected. If you encounter authentication errors, explicitly set the token in your workflow's `env` section:
> ```yaml
> env:
>   GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
> ```

## Usage

1. Create a tag: `git tag v1.0.0 && git push --tags`
2. Go to Actions tab in your repository
3. Run "Release" workflow
4. Done! Check your releases page

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
