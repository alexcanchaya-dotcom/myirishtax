'use client';
import React, { useState } from 'react';

/** "Copy link to this estimate": copies the current URL (inputs are in it). Falls back to the share sheet. */
export function CopyEstimateLink() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: document.title, url });
          setStatus('idle');
          return;
        } catch {
          /* share cancelled */
        }
      }
      setStatus('failed');
    }
    window.setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={copy} className="btn-quiet">
        Copy link to this estimate
      </button>
      <span className="text-xs text-ink-muted" aria-live="polite">
        {status === 'copied' ? 'Link copied' : status === 'failed' ? 'Copy the address bar to share' : ''}
      </span>
    </div>
  );
}
