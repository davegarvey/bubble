# Bubble Documentation

Welcome to the Bubble documentation! This directory contains comprehensive guides and architectural decision records.

## 🎯 Features

User-facing documentation for features and capabilities:

- **[Instructions Customization](features/instructions-customization.md)** - Learn how to customize AI instructions for different use cases (open source, enterprise, APIs, etc.)

## 🏛️ Architecture Decision Records (ADRs)

Technical documentation about architecture and design decisions:

- **[ADR-001: XML-Tagged Data](adr/ADR-001-xml-tagged-data.md)** - Decision to use XML tags for wrapping commit data
- **[OpenAI Responses API Architecture](adr/openai-responses-api-architecture.md)** - Complete architectural design, separation of concerns, and why we use OpenAI's Responses API
- **[Instructions-Data Separation Implementation](adr/instructions-data-separation-implementation.md)** - Detailed implementation guide covering all code changes and modifications

## Quick Links

### For Users

- [Main README](../README.md) - Getting started and basic usage
- [Instructions Customization](guides/instructions-customization.md) - Customize AI behavior

### For Contributors

- [Architecture](adr/ARCHITECTURE.md) - Understand the system design
- [Implementation](adr/IMPLEMENTATION.md) - See what was built and how

## Documentation Structure

```
docs/
├── README.md (this file)
├── features/        # User-facing feature documentation
│   └── instructions-customization.md
└── adr/            # Architecture Decision Records
    ├── ADR-001-xml-tagged-data.md
    ├── openai-responses-api-architecture.md
    └── instructions-data-separation-implementation.md
```

## Contributing to Docs

When adding new documentation:

1. **Features** - Place user-facing feature documentation in `features/`
2. **ADRs** - Place architectural decisions and technical design docs in `adr/`
3. **Index** - Update this README with links to new docs

### Naming Conventions

**Features:** Use descriptive, hyphenated names

- `instructions-customization.md`
- `github-actions-integration.md`

**ADRs:** Use contextual, descriptive names

- `ADR-001-xml-tagged-data.md` - Numbered ADRs for specific decisions
- `openai-responses-api-architecture.md` - Overall architecture descriptions
- `instructions-data-separation-implementation.md` - Implementation details
