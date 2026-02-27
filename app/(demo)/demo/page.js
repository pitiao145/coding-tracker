'use client';

import DashboardPage from '@/app/(app)/dashboard/page.js';
import { MOCK_ENTRIES, MOCK_USER_DATA } from './mock-data.js';

export default function DemoPage() {
  return (
    <DashboardPage
      mockEntries={MOCK_ENTRIES}
      mockUserData={MOCK_USER_DATA}
      demoMode={true}
      mockTodayDate="2025-02-27"
    />
  );
}
