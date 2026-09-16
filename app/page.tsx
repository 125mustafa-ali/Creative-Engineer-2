'use client';

import Link from 'next/link';
import App from '../src/App';

export default function HomePage() {
  return (
    <>
      <Link
        href="/studio"
        className="fixed top-4 right-4 z-50 bg-white text-black px-4 py-2 rounded-md text-sm font-bold"
      >
        CMS Login
      </Link>
      <App />
    </>
  );
}
