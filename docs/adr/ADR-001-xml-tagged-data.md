# ADR-001: XML-Tagged Data for Commit Information

**Status:** Accepted  
**Date:** 2025-12-16  
**Authors:** Development Team

## Context

When passing commit data to the AI model, we need a clear way to:

1. Separate instructions from data
2. Make data easily referenceable in instructions
3. Maintain structured format while being human-readable
4. Follow best practices for prompt engineering

## Decision

We will wrap commit data in XML tags when passing it as input to the AI model.

### Implementation

```javascript
const input = `<commits count="${commits.length}">
${JSON.stringify(commitData, null, 2)}
</commits>

Please analyze the commits above and generate professional release notes.`;
```

### Instructions Reference XML Tags

```javascript
const instructions = `You will receive commit data wrapped in <commits> XML tags containing structured JSON.

Instructions:
- Analyze the commits in the <commits> section
- Group changes into logical categories...`;
```

## Rationale

### Benefits of XML Tags

1. **Clear Separation** - Visual boundary between instructions and data
2. **Referenceability** - Instructions can explicitly reference `<commits>` section
3. **Metadata** - Can include attributes like `count` in opening tag
4. **Standard Pattern** - Common in prompt engineering (Claude, GPT, etc.)
5. **Extensibility** - Easy to add more XML-tagged sections (e.g., `<context>`, `<requirements>`)

### Why Not Alternatives?

**Plain JSON without tags:**

```javascript
// Less clear where data starts/ends
const input = JSON.stringify(commitData) + "\n\nGenerate notes...";
```

- No clear visual/semantic boundary
- Instructions can't reference a specific section

**Markdown code blocks:**

```javascript
const input = '```json\n' + JSON.stringify(data) + '\n```\n\nGenerate...';
```

- Markdown is for formatting, not semantic structure
- Can't include metadata easily

**Custom delimiters:**

```javascript
const input = '===BEGIN_COMMITS===\n' + data + '\n===END_COMMITS===';
```

- Non-standard, requires documentation
- Less elegant than XML

## Consequences

### Positive

- ✅ Clear, semantic structure for data
- ✅ Instructions can reference `<commits>` explicitly
- ✅ Easy to extend with additional XML sections
- ✅ Follows established prompt engineering patterns
- ✅ Human-readable and maintainable

### Negative

- ⚠️ Slight increase in token count (opening/closing tags)
- ⚠️ Must ensure commit data doesn't contain `</commits>` naturally (unlikely)

### Neutral

- Data format (JSON) remains unchanged
- Still using OpenAI Responses API
- Backward compatible (only affects internal formatting)

## Examples

### Before (Plain Text)

```javascript
Generate professional release notes from the following 2 commit(s):

[{"subject": "feat: add auth", "author": "John"}]

Please generate the release notes now.
```

### After (XML-Tagged)

```javascript
<commits count="2">
[{"subject": "feat: add auth", "author": "John"}]
</commits>

Please analyze the commits above and generate professional release notes.
```

## References

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic XML Tags Documentation](https://docs.anthropic.com/claude/docs/use-xml-tags)
- [Structured Data in Prompts (Best Practices)](https://platform.openai.com/docs/guides/text)
- [OpenAI Responses API Architecture](openai-responses-api-architecture.md) - Our architecture overview

## Future Considerations

### Potential Extensions

1. **Additional XML Sections:**

   ```xml
   <commits count="5">...</commits>
   <context>Previous release: v1.0.0</context>
   <requirements>Target audience: developers</requirements>
   ```

2. **Nested Structure:**

   ```xml
   <release>
     <commits>...</commits>
     <metadata>...</metadata>
   </release>
   ```

3. **Per-Commit Tags:**

   ```xml
   <commits>
     <commit hash="abc123">
       <subject>feat: add auth</subject>
       <author>John</author>
     </commit>
   </commits>
   ```

## Implementation Checklist

- [x] Update `formatCommitsForAI()` to wrap data in XML tags
- [x] Update default instructions to reference XML tags
- [x] Update tests to expect XML-tagged format
- [x] Verify all tests pass
- [x] Document the decision (this ADR)

## Conclusion

XML tags provide a clean, standard way to structure and reference data in prompts. This follows prompt engineering best practices and makes the system more maintainable and extensible.
