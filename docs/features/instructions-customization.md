# Instructions Customization Examples

This document demonstrates the three ways to customize AI instructions in Bubble.

## Architecture Overview

**Bubble uses OpenAI's Responses API** which separates:

- **Instructions**: How the AI should process data (behavioral rules)
- **Input**: The actual data to process (commit information as JSON)

This separation follows AI best practices and provides cleaner, more maintainable prompts.

## 1. Default Instructions (No customization)

```bash
npx github:davegarvey/bubble \
  --latest \
  --repo owner/repo \
  --github-token $GITHUB_TOKEN \
  --api-key $OPENAI_API_KEY
```

**Behavior:** Uses the built-in default instructions with standard instructions for generating professional release notes.

**Default Instructions Include:**

- Group changes into logical categories (Features, Bug Fixes, etc.)
- Focus on user-facing changes
- Use clear, concise language
- Start each item with an action verb
- Format output in Markdown
- Highlight breaking changes

---

## 2. Extend the Default Instructions

Use `--instructions-extend` to **add** custom instructions while keeping the default ones.

### Example: Add Emoji and Security Emphasis

```bash
npx github:davegarvey/bubble \
  --latest \
  --repo owner/repo \
  --github-token $GITHUB_TOKEN \
  --api-key $OPENAI_API_KEY \
  --instructions-extend "- Add emoji indicators for each category (🎉 Features, 🐛 Bug Fixes, etc.)
- Highlight security fixes with a ⚠️ emoji
- Include database migration notes if applicable"
```

### Example: Add Company-Specific Guidelines

```bash
npx github:davegarvey/bubble \
  --latest \
  --repo owner/repo \
  --github-token $GITHUB_TOKEN \
  --api-key $OPENAI_API_KEY \
  --instructions-extend "- Follow our company style guide for technical writing
- Mention Jira ticket numbers when present in commit messages
- Group API changes separately from UI changes"
```

### GitHub Actions Example

```yaml
- name: Generate Release Notes with Extended Prompt
  run: |
    npx github:davegarvey/bubble \
      --latest \
      --repo ${{ github.repository }} \
      --github-token ${{ secrets.GITHUB_TOKEN }} \
      --api-key ${{ secrets.OPENAI_API_KEY }} \
      --instructions-extend "- Use emojis for visual appeal
      - Highlight breaking changes with ⚠️ WARNING
      - Include performance improvements separately"
```

---

## 3. Replace the Entire Instructions

Use `--instructions` to **completely replace** the default instructions with your own.

### Example: Minimal Bullet Points

```bash
npx github:davegarvey/bubble \
  --latest \
  --repo owner/repo \
  --github-token $GITHUB_TOKEN \
  --api-key $OPENAI_API_KEY \
  --instructions "Create a concise bullet-point list of changes. Each item should be one line. Focus only on user-visible changes."
```

### Example: Technical Changelog

```bash
npx github:davegarvey/bubble \
  --latest \
  --repo owner/repo \
  --github-token $GITHUB_TOKEN \
  --api-key $OPENAI_API_KEY \
  --instructions "Generate a technical changelog for developers. Include:
1. API changes with before/after examples
2. Breaking changes with migration steps
3. Deprecated features
4. New dependencies
Format in Markdown with code examples."
```

### Example: Marketing-Focused Release Notes

```bash
npx github:davegarvey/bubble \
  --latest \
  --repo owner/repo \
  --github-token $GITHUB_TOKEN \
  --api-key $OPENAI_API_KEY \
  --instructions "Write customer-facing release notes in an exciting, benefit-focused style. Emphasize improvements to user experience and new capabilities. Avoid technical jargon. Use enthusiastic language."
```

### GitHub Actions Example

```yaml
- name: Generate Technical Changelog
  run: |
    npx github:davegarvey/bubble \
      --latest \
      --repo ${{ github.repository }} \
      --github-token ${{ secrets.GITHUB_TOKEN }} \
      --api-key ${{ secrets.OPENAI_API_KEY }} \
      --instructions "Create a detailed technical changelog. List all changes with commit hashes. Include breaking changes, deprecations, and migration notes."
```

---

## Priority Rules

If both `--instructions` and `--instructions-extend` are provided:

- **`--instructions` takes priority** and completely replaces the default
- `--instructions-extend` is ignored

**Example:**

```bash
# Only the custom instructions is used; prompt-extend is ignored
npx github:davegarvey/bubble \
  --latest \
  --instructions "Use this custom instructions" \
  --instructions-extend "This will be ignored"
```

---

## Use Cases by Scenario

### CI/CD for Open Source Projects

**Use:** Default prompt or `--instructions-extend` to add contributor recognition

### Enterprise Internal Tools

**Use:** `--instructions` to match company documentation standards

### API/SDK Releases

**Use:** `--instructions` for technical changelog with code examples

### Customer-Facing Products

**Use:** `--instructions-extend` to add emoji and user-friendly language

### Breaking Changes Release

**Use:** `--instructions-extend` to emphasize migration guides

### Quick Patch Release

**Use:** `--instructions` for minimal bullet-point format
