import './globals.css';
import React from 'react';

export const metadata = {
  title: 'MyIrishTax',
  description: 'World-class Irish tax calculator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
