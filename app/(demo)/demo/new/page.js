'use client';

import { Suspense } from 'react';
import NewEntryPage from '@/app/(app)/new/page.js';

export default function DemoNewPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto animate-pulse space-y-6"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-64 bg-muted rounded" /></div>}>
      <NewEntryPage demoMode={true} />
    </Suspense>
  );
}
