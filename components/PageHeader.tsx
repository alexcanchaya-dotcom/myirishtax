import React from 'react';

export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-10 max-w-2xl">
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-[2.75rem] sm:leading-tight">
        {title}
      </h1>
      {children ? (
        <div className="mt-3 space-y-2 text-base leading-relaxed text-ink-muted sm:text-lg">
          {children}
        </div>
      ) : null}
    </header>
  );
}
