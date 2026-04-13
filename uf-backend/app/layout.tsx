export const metadata = { title: 'UDF Backend — Next.js' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'monospace', background: '#0a0a0f', color: '#e2e8f0', padding: '2rem' }}>
        {children}
      </body>
    </html>
  );
}
