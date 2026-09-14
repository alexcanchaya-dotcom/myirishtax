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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{badge}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700">{children}</div>
      </article>
    </main>
  );
}
