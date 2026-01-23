/**
 * Chat with AI tax assistant using OpenAI API
 */

export async function chatWithAssistant(
  message: string,
  systemPrompt: string,
  context?: Record<string, unknown>
) {
  const apiKey = process.env.OPENAI_API_KEY;

  // If no API key, return helpful fallback message
  if (!apiKey) {
    return {
      role: 'assistant' as const,
      content: `I'm the AI tax assistant, but I haven't been configured yet. Please contact support@myirishtax.com for help with your question: "${message}"`,
    };
  }

  try {
    // Build context message if provided
    let contextMessage = '';
    if (context) {
      contextMessage = `\n\nUser's calculation context: ${JSON.stringify(context, null, 2)}`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and affordable for most queries
        messages: [
          {
            role: 'system',
            content: systemPrompt + contextMessage,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500, // Keep responses concise
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

    return {
      role: 'assistant' as const,
      content: aiMessage,
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      role: 'assistant' as const,
      content: 'I apologize, but I\'m having technical difficulties. Please try again later or contact support@myirishtax.com for assistance.',
    };
  }
}
