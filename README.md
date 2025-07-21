<div align="center">
  <h1>Gemini Grounding MCP Server</h1>
</div>

An MCP (Model Context Protocol) server that provides real-time information access using Google Gemini's grounding capabilities. This server enables MCP-compatible clients to search for current information, developer resources, documentation, and Reddit discussions using Gemini's built-in Google Search grounding.

## ❓ Why?

When working with AI assistants like Claude Code, you often need current information and community insights that are beyond the model's knowledge cutoff. Claude Code refuses to search Reddit and have limitations on accessing real-time information.

This MCP server bypasses these limitations by leveraging Gemini's grounding capabilities, which can search the web and other sources to provide current information, code examples, discussions, and community insights directly within your AI workflow.

## ✨ Features

- **🔍 Real-time Search**: Access current information through Gemini's Google Search grounding
- **👨‍💻 Developer-Focused**: Tools for searching code examples, documentation, and troubleshooting
- **💬 Reddit Integration**: Search Reddit discussions and community insights
- **📚 Automatic Citations**: Source links and attribution provided automatically by Gemini
- **🔗 Multi-Source Synthesis**: Combines information from multiple web sources
- **🎯 Context-Aware**: Tailored search results based on programming language and framework
- **✅ Fact Verification**: Built-in fact-checking and accuracy validation

## 📦 Installation

### Prerequisites

- **Node.js 18+**
- **Google Gemini API key** from [Google AI Studio](https://ai.google.dev/)

### Option 1: Use with npx

```bash
npx gemini-grounding
```

### Option 2: Build from Source

```bash
git clone https://github.com/epilande/gemini-grounding.git
cd gemini-grounding
pnpm install
pnpm build
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create or select a project
3. Generate an API key
4. Add the key to your `.env` file

## 🎮 Usage

This server works with any MCP-compatible client.

#### Claude Code

Add this server to your Claude Code MCP configuration using the `claude mcp add` command:

```bash
claude mcp add gemini-grounding -e GEMINI_API_KEY="${GEMINI_API_KEY}" -- npx -y gemini-grounding
```

Or manually add to your configuration:

```json
{
  "mcpServers": {
    "gemini-grounding": {
      "command": "npx",
      "args": ["-y", "gemini-grounding"],
      "env": {
        "GEMINI_API_KEY": "${GEMINI_API_KEY}"
      }
    }
  }
}
```

### Verification

After adding to your configuration:

1. Restart your MCP client (e.g., Claude Code)
2. Open a new conversation
3. Look for Gemini grounding tools in the tool picker
4. Test with queries like:
   - `"Why is neovim the best editor? Search reddit"`
   - `"What are the new Go lang features?"`
   - `"Latest docs for React hooks"`
   - `"What are useEffect dependency array best practices"`

## 🛠️ Tools

### `search_with_grounding`

General purpose search with Gemini grounding capabilities.

**Parameters:**

- `query` (required): Search query
- `context` (optional): Development context or additional information
- `focus` (optional): Focus area - `"general"`, `"code"`, `"documentation"`, or `"troubleshooting"`

### `search_developer_resources`

Specialized search for developer resources and documentation.

**Parameters:**

- `query` (required): Technical query
- `language` (optional): Programming language (e.g., `JavaScript`, `Python`, `Rust`)
- `framework` (optional): Framework or library (e.g., `React`, `Express`, `Django`)

### `search_documentation`

Search for official documentation and API references.

**Parameters:**

- `query` (required): Documentation query
- `technology` (optional): Technology, framework, or tool name

### `search_reddit`

Search Reddit discussions and community insights.

**Parameters:**

- `query` (required): Search query for Reddit content
- `subreddit` (optional): Specific subreddit to search (e.g., `"programming"`, `"reactjs"`)

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│        MCP-Compatible Client        │
│  • Claude Code, Cursor, etc.        │
│  • File editing & bug fixing        │
│  • Codebase analysis                │
│  • Development workflows            │
└─────────────┬───────────────────────┘
              │ MCP Integration
┌─────────────▼───────────────────────┐
│   Node.js Grounding Agent Service   │
│  • Query routing & analysis         │
│  • Context management               │
│  • Response formatting              │
└─────────────┬───────────────────────┘
              │ Single API Call
┌─────────────▼───────────────────────┐
│      Gemini 2.5 Flash               │
│  • Google Search grounding          │
│  • Real-time information access     │
│  • Automatic source citation        │
│  • Multi-source synthesis           │
└─────────────────────────────────────┘
```

## 🔧 Development

```bash
# Development mode
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

## 🐛 Troubleshooting

### Common Issues

**Server fails to start with "GEMINI_API_KEY environment variable is required"**

- Ensure you've created a `.env` file with your API key
- Or pass the API key in the MCP configuration `env` section
- Verify your API key is valid at [Google AI Studio](https://ai.google.dev/)

**Tools don't appear in your MCP client**

- Check that the file path in your configuration is absolute and correct
- Restart your MCP client after making configuration changes
- Verify the server builds successfully with `pnpm build`
- Check your client's logs for any error messages

**"Module not found" errors**

- Run `pnpm install` to ensure all dependencies are installed
- Make sure you're using Node.js 18 or later
- Try deleting `node_modules` and running `pnpm install` again

**Search requests fail or timeout**

- Verify your Gemini API key has quota remaining
- Check your internet connection
- Ensure the Gemini API service is accessible from your network
