'use client';
import React, { useState } from 'react';

export function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);

  const send = async () => {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    setHistory((h) => [...h, { role: 'user', content: message }, data.reply]);
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-brand-600 px-4 py-2 text-white shadow-lg"
      >
        AI Tax Assistant
      </button>
      {open && (
        <div className="mt-3 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
          <div className="max-h-60 space-y-2 overflow-y-auto text-sm">
            {history.map((item, idx) => (
              <div key={idx} className={item.role === 'assistant' ? 'text-brand-600' : 'text-gray-800'}>
                <strong>{item.role}:</strong> {item.content}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about PAYE, USC, PRSI..."
            />
            <button onClick={send} className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
