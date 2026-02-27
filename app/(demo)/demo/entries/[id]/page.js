'use client';

import { use } from 'react';
import Link from 'next/link';
import EntryDetailPage from '@/app/(app)/entries/[id]/page.js';
import { MOCK_ENTRIES } from '../../mock-data.js';

export default function DemoEntryDetailPage({ params }) {
  const resolvedParams = use(params);
  const entryId = resolvedParams.id;
  const mockEntry = MOCK_ENTRIES.find(e => e.id === entryId);

  if (!mockEntry) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <p className="text-muted-foreground">Entry not found.</p>
        <Link href="/demo/entries" className="text-primary hover:underline">Back to Entries</Link>
      </div>
    );
  }

  return (
    <EntryDetailPage
      params={params}
      mockEntry={mockEntry}
      demoMode={true}
    />
  );
}
