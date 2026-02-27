'use client';

import EntriesPage from '@/app/(app)/entries/page.js';
import { MOCK_ENTRIES } from '../mock-data.js';

export default function DemoEntriesPage() {
  return (
    <EntriesPage
      mockEntries={MOCK_ENTRIES}
      demoMode={true}
    />
  );
}
