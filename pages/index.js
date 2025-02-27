import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Редирект на dashboard.html
    window.location.href = '/dashboard.html';
  }, []);

  return <div>Redirecting...</div>;
}
