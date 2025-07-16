# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that enables Claude Code to access real-time information through Google Gemini's native grounding capabilities. The server provides four specialized search tools for web search, developer resources, documentation lookup, and Reddit community discussions.

## Development Commands

```bash
# Development (auto-reload)
pnpm dev

# Build TypeScript to JavaScript
pnpm run build

# Run compiled server
pnpm start
```

## Environment Setup

Required environment variable:
- `GEMINI_API_KEY`: Google Gemini API key (get from [Google AI Studio](https://aistudio.google.com))

Copy `.env.example` to `.env` and add your API key.

## MCP Configuration

The server is configured via `.mcp.json` for integration with Claude Code:
- Server name: `gemini-grounding`
- Entry point: `build/index.js`
- Includes environment variable mapping for `GEMINI_API_KEY`

## Code Architecture

### Core Components

**`src/index.ts`**: Main MCP server implementation
- `GroundingMCPServer` class handles MCP protocol
- Registers four tools: `search_with_grounding`, `search_developer_resources`, `search_documentation`, `search_reddit`
- Uses stdio transport for communication with Claude Code
- Uses `gemini-2.5-flash` model for responses

**`src/gemini-client.ts`**: Gemini API client
- `GeminiGroundingClient` class manages Gemini API interactions
- Implements intelligent prompt engineering based on search focus
- Handles response formatting with automatic source citations
- Provides developer query enhancement and Reddit search filtering

### Tool Implementation

The server provides four specialized search tools:

1. **`search_with_grounding`**: General search with intelligent focus
   - Parameters: `query` (required), `context` (optional), `focus` (optional)
   - Focus options: "general", "code", "documentation", "troubleshooting"

2. **`search_developer_resources`**: Developer-focused search
   - Parameters: `query` (required), `language` (optional), `framework` (optional)
   - Enhanced with developer-specific terminology

3. **`search_documentation`**: Official documentation search
   - Parameters: `query` (required), `technology` (optional)
   - Optimized for finding official docs and API references

4. **`search_reddit`**: Reddit community discussions
   - Parameters: `query` (required), `subreddit` (optional)
   - Filters results to Reddit discussions and community insights

Each tool follows the pattern:
1. Validate input parameters using Zod schemas
2. Call appropriate GeminiGroundingClient method
3. Return formatted response with grounding citations
4. Handle errors gracefully with user-friendly messages

### Key Dependencies

- `@modelcontextprotocol/sdk@^1.15.1`: MCP server framework
- `@google/genai@^1.0.0`: Google Gemini API client
- `zod@^3.23.8`: Schema validation for MCP compatibility
- `dotenv@^17.0.0`: Environment variable management

## Integration Notes

This server integrates with Claude Code via MCP configuration. The build output in `build/index.js` is the entry point for the MCP server and includes a `gemini-grounding` binary executable. The project uses TypeScript compilation targeting ES2022 with strict mode enabled and ESM modules.

## Testing

No test suite is currently implemented. When adding tests, consider testing the tool handlers, Gemini client responses, and error handling scenarios.