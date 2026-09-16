import React from 'react';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, height: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
