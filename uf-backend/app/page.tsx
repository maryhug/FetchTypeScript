export default function Page() {
  const routes = [
    'GET    /api/health',
    '',
    'GET    /api/fruits',
    'GET    /api/fruits/:id',
    'POST   /api/fruits',
    'PUT    /api/fruits/:id',
    'DELETE /api/fruits/:id',
    '',
    'GET    /api/users',
    'GET    /api/users/:id',
    'POST   /api/users',
    'PUT    /api/users/:id',
    'DELETE /api/users/:id',
    '',
    'GET    /api/apod',
    'GET    /api/apod/range',
    'GET    /api/apod/:id',
    'POST   /api/apod',
    'PUT    /api/apod/:id',
    'DELETE /api/apod/:id',
  ];

  return (
    <pre style={{ lineHeight: 1.7 }}>
      {'Universal Data Fetcher — Backend Next.js (:3000)\n\n'}
      {'Endpoints disponibles:\n\n'}
      {routes.map((r, i) => (r ? `  ${r}\n` : '\n')).join('')}
    </pre>
  );
}
