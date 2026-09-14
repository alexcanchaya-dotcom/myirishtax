import React from 'react';

export function LegalArticle({
  badge,
  title,
  children,
}: {
  badge: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{badge}</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold">{title}</h1>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-muted">{children}</div>
    </main>
  );
}
