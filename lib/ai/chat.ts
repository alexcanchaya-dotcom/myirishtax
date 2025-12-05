export async function chatWithAssistant(message: string, context?: Record<string, unknown>) {
  // Placeholder: integrate with OpenAI/LLM later
  return {
    role: 'assistant',
    content: `You asked: ${message}. I am an Irish tax assistant. ${context ? 'Context loaded.' : ''}`,
  };
}
