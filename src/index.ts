#!/usr/bin/env node

// Suppress punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return; // Ignore punycode deprecation warnings
  }
  console.warn(warning.message);
});

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config } from "dotenv";
import { GeminiGroundingClient } from "./gemini-client.js";

// Load environment variables
config();

class GroundingMCPServer {
  private server: McpServer;
  private geminiClient: GeminiGroundingClient;

  constructor() {
    this.server = new McpServer({
      name: "gemini-grounding-agent",
      version: "1.0.0"
    });
    
    this.geminiClient = new GeminiGroundingClient();
    this.setupTools();
  }

  private setupTools() {
    // Register search with grounding tool
    this.server.registerTool(
      "search_with_grounding",
      {
        title: "Search with Grounding",
        description: "Search for current information using Gemini grounding",
        inputSchema: {
          query: z.string(),
          context: z.string().optional(),
          focus: z.enum(["general", "code", "documentation", "troubleshooting"]).optional()
        }
      },
      async ({ query, context, focus }) => {
        try {
          const result = await this.geminiClient.searchWithGrounding({
            query,
            context,
            focus: focus as any
          });
          
          return {
            content: [{
              type: "text",
              text: result
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            }],
            isError: true
          };
        }
      }
    );

    // Register developer resources search tool
    this.server.registerTool(
      "search_developer_resources",
      {
        title: "Search Developer Resources",
        description: "Search specifically for developer resources and documentation",
        inputSchema: {
          query: z.string(),
          language: z.string().optional(),
          framework: z.string().optional()
        }
      },
      async ({ query, language, framework }) => {
        try {
          // Enhance query for developer-focused results
          const enhancedQuery = this.geminiClient.buildDeveloperQuery(query, language, framework);
          
          const result = await this.geminiClient.searchWithGrounding({
            query: enhancedQuery,
            context: "developer resources",
            focus: "code",
            language,
            framework
          });
          
          return {
            content: [{
              type: "text",
              text: result
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            }],
            isError: true
          };
        }
      }
    );

    // Register documentation search tool
    this.server.registerTool(
      "search_documentation",
      {
        title: "Search Documentation",
        description: "Search for official documentation and API references",
        inputSchema: {
          query: z.string(),
          technology: z.string().optional()
        }
      },
      async ({ query, technology }) => {
        try {
          let enhancedQuery = query;
          if (technology) {
            enhancedQuery = `${technology} ${query} official documentation`;
          }
          
          const result = await this.geminiClient.searchWithGrounding({
            query: enhancedQuery,
            context: "official documentation and API references",
            focus: "documentation"
          });
          
          return {
            content: [{
              type: "text",
              text: result
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            }],
            isError: true
          };
        }
      }
    );

    // Register Reddit search tool
    this.server.registerTool(
      "search_reddit",
      {
        title: "Search Reddit",
        description: "Search Reddit discussions and community insights",
        inputSchema: {
          query: z.string(),
          subreddit: z.string().optional()
        }
      },
      async ({ query, subreddit }) => {
        try {
          const redditQuery = this.geminiClient.buildRedditQuery(query, subreddit);
          
          const result = await this.geminiClient.searchWithGrounding({
            query: redditQuery,
            context: `Search Reddit discussions about ${query}${subreddit ? ` in r/${subreddit}` : ''}. Find indexed Reddit posts and comments with user opinions, experiences, and community insights.`
          });
          
          return {
            content: [{
              type: "text",
              text: result
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            }],
            isError: true
          };
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Gemini Grounding MCP Server running on stdio");
  }
}

// Start the server
async function main() {
  try {
    const server = new GroundingMCPServer();
    await server.run();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
