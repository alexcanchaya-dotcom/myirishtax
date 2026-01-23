'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X, Send, Crown, Loader2 } from 'lucide-react';
import { useSubscription } from '@/lib/hooks/useSubscription';

export function FloatingAIChat() {
  const { data: session } = useSession();
  const { features, tier } = useSubscription();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = async () => {
    if (!message.trim() || isLoading) return;

    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    if (!features.canUseAIAssistant) {
      router.push('/dashboard/subscription');
      return;
    }

    const userMessage = message;
    setMessage('');
    setHistory((h) => [...h, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setHistory((h) => [...h, data.reply]);
      } else {
        setHistory((h) => [
          ...h,
          {
            role: 'assistant',
            content: data.error || 'Sorry, I encountered an error. Please try again.',
          },
        ]);
      }
    } catch (error) {
      setHistory((h) => [
        ...h,
        {
          role: 'assistant',
          content: 'Sorry, I encountered a network error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Don't show for free users
  if (!session?.user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">AI Tax Assistant</span>
          {tier === 'PROFESSIONAL' && <Crown className="h-4 w-4" />}
        </button>
      )}

      {open && (
        <div className="w-96 rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-xl">
            <div className="flex items-center gap-2 text-white">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">AI Tax Assistant</h3>
              {tier === 'PROFESSIONAL' && <Crown className="h-4 w-4" />}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:bg-white/20 rounded p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="max-h-96 min-h-[200px] overflow-y-auto p-4 space-y-3">
            {history.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Ask me anything about Irish tax!</p>
                <p className="text-xs mt-2">PAYE, USC, PRSI, self-employed, rental income, and more...</p>
              </div>
            )}

            {history.map((item, idx) => (
              <div
                key={idx}
                className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    item.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-800 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          {features.canUseAIAssistant ? (
            <div className="border-t border-gray-200 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about tax..."
                  disabled={isLoading}
                />
                <button
                  onClick={send}
                  disabled={!message.trim() || isLoading}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 p-4 bg-purple-50">
              <div className="text-center">
                <Crown className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Professional Feature
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Upgrade to Professional to chat with our AI tax assistant
                </p>
                <button
                  onClick={() => router.push('/dashboard/subscription')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700"
                >
                  Upgrade to Professional
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
