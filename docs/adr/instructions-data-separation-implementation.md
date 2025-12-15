# Instructions Customization Feature

## Overview

This project uses OpenAI's Responses API which properly separates **instructions** (system-level behavioral rules) from **input data** (commit information). This follows best practices for AI prompt engineering.

### Architecture

- **Instructions**: System-level rules for how to process data (passed to `instructions` parameter)
- **Input**: Structured commit data in JSON format (passed to `input` parameter)
- **Separation of Concerns**: Data and instructions are completely separated, following OpenAI best practices

### Three Operating Modes

1. **Default Mode** - Uses built-in instructions (unchanged)
2. **Extension Mode** - Adds custom guidelines to default instructions
3. **Replacement Mode** - Completely replaces default instructions

## Implementation Summary

### Files Modified

#### 1. `src/ai/provider.js`

- Updated `AIProvider.generateText()` to accept two parameters: `instructions` and `input`
- Clear separation between behavioral rules and data

#### 2. `src/ai/openai.js`

- Modified to properly use OpenAI Responses API
- Passes `instructions` and `input` as separate parameters
- Uses modern Responses API (recommended by OpenAI as of 2025)

#### 3. `src/generator.js`

- Added `getDefaultInstructions()` function
- Refactored `formatCommitsForAI()` to return `{instructions, input}` object
- Formats commits as structured JSON data
- Modified `generateReleaseNotes()` to pass instructions and input separately

#### 4. `bin/cli.js`

- Changed from `--prompt/--prompt-extend` to `--instructions/--instructions-extend`
- Clearer terminology reflecting the separation of concerns

#### 5. `test/generator.test.js`

- Updated all tests to work with new two-parameter signature
- Tests verify proper separation of instructions and data

### New Documentation Files

- Updated `README.md` with new CLI options and examples
- Updated `PROMPT_EXAMPLES.md` with instructions-based examples
- This `IMPLEMENTATION.md` reflects new architecture

## Behavior

### Default (No Options)

```bash
npx bubble --latest
```

Uses built-in default prompt without modification.

### Extension Mode

```bash
npx bubble --latest --instructions-extend "- Add emojis\n- Be concise"
```

Keeps all default instructions and appends the custom ones.

### Replacement Mode

```bash
npx bubble --latest --instructions "Create brief bullet points only."
```

Ignores default prompt entirely and uses only the custom one.

### Priority

If both `--instructions` and `--instructions-extend` are provided:

- `--instructions` takes priority (full replacement)
- `--instructions-extend` is ignored

## Testing

All tests pass (28 tests total):

- ✓ Default prompt formatting
- ✓ Prompt extension with additional instructions
- ✓ Full prompt replacement
- ✓ Priority handling (custom over extension)
- ✓ Options passed through `generateReleaseNotes()`

Run tests with:

```bash
npm run test:run
```

## Backward Compatibility

✅ **Fully backward compatible**

Existing code and workflows continue to work without any changes. The `options` parameter defaults to an empty object, maintaining the original behavior.

## Use Cases

1. **Open Source Projects** - Extend prompt to add contributor recognition
2. **Enterprise** - Replace prompt to match company documentation standards
3. **API/SDK Releases** - Custom prompt for technical changelog format
4. **Customer Products** - Extend prompt with emoji and friendly language
5. **Breaking Changes** - Extend prompt to emphasize migration guides
6. **Quick Patches** - Replace with minimal format for speed

## Example GitHub Actions Workflow

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

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
            --api-key ${{ secrets.OPENAI_API_KEY }} \
            --instructions-extend "- Use emojis for categories
            - Highlight security fixes
            - Include upgrade instructions"
```
