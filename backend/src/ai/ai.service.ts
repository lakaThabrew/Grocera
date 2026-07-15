/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Type, Schema, Content } from '@google/genai';
import { PrismaService } from '../prisma.service';

export interface NormalizedProduct {
  canonicalName: string;
  brand: string | null;
  weight: string | null;
  canonicalId: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private primaryAi: GoogleGenAI;
  private backupAi: GoogleGenAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    // Requires GEMINI_API_KEY in the environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.primaryAi = new GoogleGenAI({ apiKey });

    // Check if backup key is provided
    let backupKey = process.env.GEMINI_API_KEY_BACKUP;
    if (backupKey) {
      // Clean quotes/spaces if any
      backupKey = backupKey.replace(/['"]+/g, '').trim();
      this.backupAi = new GoogleGenAI({ apiKey: backupKey });
      this.logger.log('Backup Gemini API key detected and configured.');
    }
  }

  /**
   * Helper method to execute Gemini calls with automatic retries for rate limits,
   * fallback to alternative models, and fallback to a secondary API key if provided.
   */
  private async executeWithFallback(
    operation: (aiClient: GoogleGenAI, model: string) => Promise<any>,
  ): Promise<any> {
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro',
    ];

    const clients = [{ name: 'Primary Key', client: this.primaryAi }];
    if (this.backupAi) {
      clients.push({ name: 'Backup Key', client: this.backupAi });
    }

    let lastError: any = null;

    for (const { name: clientName, client } of clients) {
      for (const model of modelsToTry) {
        const maxRetries = 3;
        let delay = 1000;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            if (
              attempt > 0 ||
              model !== 'gemini-3.5-flash' ||
              clientName !== 'Primary Key'
            ) {
              this.logger.debug(
                `Attempting AI operation using ${clientName} -> model '${model}' (attempt ${attempt + 1}/${maxRetries})...`,
              );
            }
            return await operation(client, model);
          } catch (error: any) {
            lastError = error;
            const msg =
              error.message?.toLowerCase() || String(error).toLowerCase();

            // Check if retriable (Rate limit, Unavailable, Quota)
            const isRetriable =
              msg.includes('429') ||
              msg.includes('503') ||
              msg.includes('resource_exhausted') ||
              msg.includes('unavailable') ||
              msg.includes('quota') ||
              msg.includes('rate limit') ||
              msg.includes('too many requests');

            if (isRetriable && attempt < maxRetries - 1) {
              this.logger.warn(
                `${clientName} -> Model '${model}' temporary error. Retrying in ${delay}ms...`,
              );
              await new Promise((res) => setTimeout(res, delay));
              delay *= 2;
              continue;
            } else {
              this.logger.error(
                `${clientName} -> Model '${model}' failed: ${error.message || msg}`,
              );
              break; // Break out of retry loop to move to the next fallback model
            }
          }
        }
      }

      // If we exit the models loop and have a backup client, it means all models on the primary client failed.
      if (clients.length > 1 && clientName === 'Primary Key') {
        this.logger.warn(
          `All models failed on Primary Key. Switching to Backup Key...`,
        );
      }
    }

    throw (
      lastError ||
      new Error(
        'Failed to execute AI operation after all fallbacks and backup keys.',
      )
    );
  }

  /**
   * Normalizes a raw product name into structured data using Gemini.
   */
  async normalizeProduct(rawName: string): Promise<NormalizedProduct> {
    this.logger.debug(`Normalizing product: ${rawName}`);

    try {
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          canonicalName: {
            type: Type.STRING,
            description:
              "The clean, generic name of the product without weights, units, or store-specific jargon. E.g., 'Anchor Full Cream Milk Powder'",
          },
          brand: {
            type: Type.STRING,
            description:
              "The brand name. E.g., 'Anchor'. If no brand is evident, return null.",
            nullable: true,
          },
          weight: {
            type: Type.STRING,
            description:
              "The weight or volume including the unit (e.g., '400g', '1kg', '500ml'). If none, return null.",
            nullable: true,
          },
        },
        required: ['canonicalName'],
      };

      const prompt = `
        You are a retail data normalizer. Extract the structured details from the following raw supermarket product name.
        Be extremely precise. 
        Raw Name: "${rawName}"
      `;

      const response = await this.executeWithFallback((aiClient, model) =>
        aiClient.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.1,
          },
        }),
      );

      if (!response.text) {
        throw new Error('No response from Gemini');
      }

      const parsed = JSON.parse(response.text);

      // Generate a deterministic slug for the canonical ID
      // Format: brand-canonicalName-weight
      const components = [parsed.brand, parsed.canonicalName, parsed.weight]
        .filter(Boolean)
        .join('-')
        .toLowerCase();

      // Simple slugify
      const canonicalId = components
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
        .replace(/(^-|-$)/g, ''); // Remove leading/trailing dashes

      return {
        canonicalName: parsed.canonicalName,
        brand: parsed.brand || null,
        weight: parsed.weight || null,
        canonicalId: canonicalId,
      };
    } catch (error) {
      this.logger.error(`Failed to normalize product "${rawName}":`, error);
      // Fallback in case AI fails
      const fallbackId = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return {
        canonicalName: rawName,
        brand: null,
        weight: null,
        canonicalId: fallbackId,
      };
    }
  }

  /**
   * Conversational Assistant that uses Tool Calling to search the DB
   */
  async chatWithAssistant(
    userMessage: string,
    history: any[] = [],
  ): Promise<string> {
    this.logger.debug(`Chat query: ${userMessage}`);

    try {
      // Define the tool for searching products
      const tools = [
        {
          functionDeclarations: [
            {
              name: 'search_products',
              description:
                'Search the supermarket database for products to find prices, availability, and stores.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  query: {
                    type: Type.STRING,
                    description:
                      'The search term (e.g., "milk powder", "rice", "anchor")',
                  },
                },
                required: ['query'],
              },
            },
          ],
        },
      ];

      const systemInstruction = `
        You are the Grocera AI Shopping Assistant for Sri Lanka. 
        Your goal is to help users find the best prices, compare products across supermarkets (Keells, Cargills, Arpico), and give smart shopping advice.
        When asked about products or prices, ALWAYS use the search_products tool to look up current data. 
        Summarize the findings clearly and highlight the cheapest option. Format your response in clean Markdown.
      `;

      // Build conversation history format for Google Gen AI
      // The SDK expects an array of Content objects { role: 'user' | 'model', parts: [{text: '...'}] }
      const contents: Content[] = history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Append the new user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      let chatResponse = await this.executeWithFallback((aiClient, model) =>
        aiClient.models.generateContent({
          model: model,
          contents,
          config: {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            tools,
          },
        }),
      );

      // Check if the AI decided to call the tool
      if (chatResponse.functionCalls && chatResponse.functionCalls.length > 0) {
        const call = chatResponse.functionCalls[0];
        if (call.name === 'search_products') {
          const args = call.args as { query: string };
          this.logger.log(
            `AI called search_products with query: ${args.query}`,
          );

          // Execute Prisma query
          const products = await this.prisma.product.findMany({
            where: {
              name: { contains: args.query, mode: 'insensitive' },
            },
            include: {
              store: true,
              prices: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
            take: 20,
          });

          // Format results for the AI
          const searchResults = products.map((p) => ({
            name: p.name,
            store: p.store.name,
            price: p.prices.length > 0 ? p.prices[0].price : 'Unknown',
            brand: p.brand,
            weight: p.weight,
          }));

          // Send the tool response back to the model
          const modelContent = chatResponse.candidates?.[0]?.content;
          if (modelContent) {
            contents.push(modelContent); // Append model's tool call
          }
          contents.push({
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: 'search_products',
                  response: { results: searchResults },
                },
              },
            ],
          });

          // Get final response from AI
          chatResponse = await this.executeWithFallback((aiClient, model) =>
            aiClient.models.generateContent({
              model: model,
              contents,
              config: {
                systemInstruction: { parts: [{ text: systemInstruction }] },
              },
            }),
          );
        }
      }

      return chatResponse.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      this.logger.error('Error in chatWithAssistant:', error);
      return "I'm currently experiencing technical difficulties. Please try again later.";
    }
  }

  /**
   * Generates a natural language explanation for a basket optimization result.
   */
  async generateOptimizationExplanation(
    shoppingList: string[],
    result: any,
  ): Promise<string> {
    this.logger.debug('Generating optimization explanation');
    try {
      const prompt = `
        You are the Grocera AI Shopping Assistant. 
        The user wants to buy: ${shoppingList.join(', ')}.
        The optimization engine found this result:
        ${JSON.stringify(result, null, 2)}
        
        Write a concise, friendly paragraph (max 3 sentences) explaining this result to the user.
        Highlight the total savings and whether they need to visit multiple stores. Use LKR for currency.
        Do not use markdown formatting like bolding or lists, just plain text.
      `;

      const response = await this.executeWithFallback((aiClient, model) =>
        aiClient.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            temperature: 0.3,
          },
        }),
      );

      return response.text || "We've optimized your basket to save you money!";
    } catch (error) {
      this.logger.error('Failed to generate optimization explanation', error);
      return "We've optimized your basket to find the best possible prices.";
    }
  }
}
