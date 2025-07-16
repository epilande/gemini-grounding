import { GoogleGenAI } from '@google/genai';

export interface GroundingSearchOptions {
  query: string;
  context?: string;
  focus?: 'general' | 'code' | 'documentation' | 'troubleshooting';
  language?: string;
  framework?: string;
}

export class GeminiGroundingClient {
  private genAI: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenAI({ apiKey });
  }

  async searchWithGrounding(options: GroundingSearchOptions): Promise<string> {
    const prompt = this.buildPrompt(options);
    const systemInstruction = `You are a developer-focused search assistant. When searching for information:
    - Prioritize official documentation, GitHub repositories, and Stack Overflow answers
    - Include practical code examples when available
    - Focus on current, up-to-date information
    - Provide clear citations and source links
    - Highlight any version-specific or compatibility information
    - Format responses clearly with proper markdown syntax`;

    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemInstruction + '\n\n' + prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      return this.formatGroundedResponse(result);
    } catch (error) {
      console.error('Gemini grounding error:', error);
      throw new Error(`Failed to get grounded response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(options: GroundingSearchOptions): string {
    const { query, context, focus, language, framework } = options;
    
    let prompt = `Search for current, accurate information about: ${query}\n\n`;
    
    prompt += `Current date: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }

    if (language) {
      prompt += `Programming Language: ${language}\n`;
    }

    if (framework) {
      prompt += `Framework/Library: ${framework}\n`;
    }

    switch (focus) {
      case 'code':
        prompt += `Focus on:
        - Code examples and implementations
        - Best practices and patterns
        - GitHub repositories and open source projects
        - Technical tutorials and guides\n\n`;
        break;
      case 'documentation':
        prompt += `Focus on:
        - Official documentation and API references
        - Getting started guides and tutorials
        - Version compatibility and requirements
        - Configuration and setup instructions\n\n`;
        break;
      case 'troubleshooting':
        prompt += `Focus on:
        - Common issues and solutions
        - Error messages and debugging
        - Stack Overflow discussions
        - GitHub issues and bug reports\n\n`;
        break;
      default:
        prompt += `Provide comprehensive information including:
        - Overview and key concepts
        - Practical examples and use cases
        - Recent developments and updates
        - Relevant resources and documentation\n\n`;
    }

    prompt += `Please provide:
    1. A clear, comprehensive answer
    2. Relevant code examples where applicable
    3. Proper source citations with links
    4. Any important version or compatibility notes`;

    return prompt;
  }

  private formatGroundedResponse(response: any): string {
    // Extract text content from response
    let formattedResponse = '';
    
    if (response.candidates?.[0]?.content?.parts) {
      formattedResponse = response.candidates[0].content.parts
        .map((part: any) => part.text || '')
        .join('');
    } else if (response.text) {
      formattedResponse = response.text;
    } else {
      formattedResponse = 'No response content found';
    }
    
    // Extract and format grounding metadata
    if (response.candidates?.[0]?.groundingMetadata) {
      const groundingMetadata = response.candidates[0].groundingMetadata;
      
      if (groundingMetadata.groundingChunks?.length > 0) {
        formattedResponse += '\n\n## Sources\n';
        
        groundingMetadata.groundingChunks.forEach((chunk: any, index: number) => {
          if (chunk.web?.uri) {
            const title = chunk.web.title || `Source ${index + 1}`;
            formattedResponse += `${index + 1}. [${title}](${chunk.web.uri})\n`;
          }
        });
      }

      // Add search queries used if available
      if (groundingMetadata.searchEntryPoint?.renderedContent) {
        formattedResponse += '\n*Search queries used: ' + 
          groundingMetadata.searchEntryPoint.renderedContent + '*\n';
      }
    }

    return formattedResponse;
  }

  buildDeveloperQuery(query: string, language?: string, framework?: string): string {
    let enhancedQuery = query;
    
    if (language) {
      enhancedQuery += ` ${language}`;
    }
    
    if (framework) {
      enhancedQuery += ` ${framework}`;
    }
    
    // Add developer-focused search terms
    enhancedQuery += ' documentation examples tutorial github stackoverflow';
    
    return enhancedQuery;
  }

  buildRedditQuery(query: string, subreddit?: string): string {
    let redditQuery = `${query} site:reddit.com`;
    
    if (subreddit) {
      redditQuery = `${query} site:reddit.com/r/${subreddit}`;
    }
    
    return redditQuery;
  }
}