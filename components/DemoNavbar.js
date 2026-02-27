'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DemoNavbar() {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/demo" className="text-xl font-bold">
            30-Day Challenge
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/demo/new">
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Log Today
              </Button>
            </Link>
            <Badge variant="secondary">Demo</Badge>
          </div>
        </div>
      </div>
    </nav>
  );
}
