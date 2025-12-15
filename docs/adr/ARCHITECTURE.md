# Bubble Architecture

## Overview

Bubble uses **OpenAI's Responses API** (the modern, recommended approach as of 2025) with proper separation of concerns between instructions and data.

## Key Design Principles

### 1. Separation of Concerns

Following OpenAI best practices, we separate:

- **Instructions**: System-level behavioral rules (how to process data)
- **Input**: The actual data to process (commit information)

This mirrors the programming concept of separating function definition from function arguments.

### 2. Structured Data

Commits are formatted as **structured JSON wrapped in XML tags** for clear semantic boundaries:

```xml
<commits count="2">
[
  {
    "subject": "feat: add authentication",
    "author": "John Doe",
    "hash": "abc123de",
    "body": "Implementation details"
  }
]
</commits>
```

**Why XML tags?**

- Clear visual/semantic boundary between instructions and data
- Instructions can explicitly reference the `<commits>` section
- Standard pattern in prompt engineering
- Easy to extend with additional sections (e.g., `<context>`, `<metadata>`)
- See [ADR-001](ADR-001-xml-tagged-data.md) for full rationale

### 3. Configurable Instructions

Users can customize AI behavior in three ways:

1. **Default** - Use built-in instructions
2. **Extend** - Add custom guidelines to default instructions
3. **Replace** - Completely override with custom instructions

## API Flow

```
CLI Input
  ↓
generateReleaseNotes(commits, aiProvider, options)
  ↓
formatCommitsForAI(commits, options)
  ├─→ instructions (string)
  └─→ input (structured JSON string)
  ↓
aiProvider.generateText(instructions, input)
  ↓
OpenAI Responses API
  └─→ model: 'gpt-4o'
  └─→ instructions: <behavioral rules>
  └─→ input: <commit data as JSON>
  ↓
Generated Release Notes
```

## Components

### 1. AIProvider Base Class (`src/ai/provider.js`)

```javascript
async generateText(instructions, input)
```

- Abstract base class for AI providers
- Enforces two-parameter signature
- Separates instructions from data

### 2. OpenAI Provider (`src/ai/openai.js`)

```javascript
await this.client.responses.create({
    model: this.model,
    instructions: instructions,
    input: input
});
```

- Uses modern Responses API (recommended by OpenAI)
- Direct mapping: instructions → instructions, input → input
- No mixing of concerns

### 3. Generator (`src/generator.js`)

**Key Functions:**

- `getDefaultInstructions()` - Returns default behavioral rules
- `formatCommitsForAI(commits, options)` - Returns `{instructions, input}`
- `generateReleaseNotes(commits, provider, options)` - Orchestrates generation

**Options:**

- `customInstructions` - Replace default instructions
- `instructionsExtension` - Append to default instructions

### 4. CLI (`bin/cli.js`)

**Options:**

- `--instructions <text>` - Custom instructions (replace default)
- `--instructions-extend <text>` - Additional guidelines (extend default)

## Why This Architecture?

### 1. **Follows OpenAI Best Practices**

From OpenAI documentation:
> "You could think about developer and user messages like a function and its arguments in a programming language. Developer messages provide the system's rules and business logic, like a function definition. User messages provide inputs and configuration to which the developer message instructions are applied, like arguments to a function."

### 2. **Cleaner Separation**

- Instructions define **how** to process
- Input provides **what** to process
- No mixing of behavioral rules with data

### 3. **Better Maintainability**

- Instructions can be changed independently of data format
- Data structure is consistent (JSON)
- Easier to test and debug

### 4. **Structured Data Benefits**

- JSON format is machine-parseable
- Consistent structure across all commits
- Can easily add/remove fields without text parsing

### 5. **User Customization**

- Users control behavior (instructions)
- Data format remains consistent
- Clear separation between "what" and "how"

## Testing

All tests verify:

1. Instructions and input are separate
2. Custom instructions properly override/extend defaults
3. Structured commit data is correctly formatted
4. Two-parameter signature is enforced

```javascript
const [instructions, input] = mockProvider.generateText.mock.calls[0];
expect(instructions).toContain('behavioral rules');
expect(input).toContain('structured data');
```

## Future Enhancements

Potential improvements that maintain this architecture:

1. **Structured Output** - Use OpenAI's structured output format for release notes
2. **Template Support** - Allow users to specify output templates
3. **Multi-Provider** - Support other AI providers with same interface
4. **Caching** - Cache structured commit data for repeated generations
5. **Validation** - Validate generated output against schema

All can be implemented while maintaining the instructions/input separation.

## References

- [OpenAI Responses API Documentation](https://platform.openai.com/docs/api-reference/responses)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
