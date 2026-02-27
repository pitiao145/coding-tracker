'use client';

import DemoNavbar from '@/components/DemoNavbar';

export default function DemoLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <DemoNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
