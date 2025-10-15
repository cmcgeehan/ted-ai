import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY!;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

export const anthropic = new Anthropic({
  apiKey: apiKey,
});

/**
 * Run a Claude prompt with the Messages API
 * @param prompt The user prompt to send to Claude
 * @param systemPrompt Optional system prompt for context
 * @param model The Claude model to use (default: claude-3-5-sonnet-20241022)
 * @returns The text response from Claude
 */
export async function runClaude(
  prompt: string,
  systemPrompt?: string,
  model: string = 'claude-3-5-sonnet-20241022'
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from the response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return textContent.text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Run a Claude prompt and parse the response as JSON
 * @param prompt The user prompt to send to Claude
 * @param systemPrompt Optional system prompt for context
 * @returns The parsed JSON response from Claude
 */
export async function runClaudeJSON<T = any>(
  prompt: string,
  systemPrompt?: string
): Promise<T> {
  const response = await runClaude(prompt, systemPrompt);

  // Extract JSON from markdown code blocks if present
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : response;

  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse Claude response as JSON:', response);
    throw new Error('Claude response was not valid JSON');
  }
}
