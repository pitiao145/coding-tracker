'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2, Clock, Code, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function EntryDetailPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const entryId = resolvedParams.id;

  
  const loadEntry = useCallback(async () => {
    try {
      setLoading(true);
      const entryDoc = await getDoc(doc(db, 'entries', entryId));
      if (entryDoc.exists()) {
        const data = entryDoc.data();
        // Check if user owns this entry
        if (data.uid === user.uid) {
          setEntry({ id: entryDoc.id, ...data });
        } else {
          toast.error('Entry not found');
          router.push('/dashboard');
        }
      } else {
        toast.error('Entry not found');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      toast.error('Failed to load entry');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [entryId, user, router]);
  
  useEffect(() => {
    if (user && entryId) {
      loadEntry();
    }
  }, [user, entryId, loadEntry]);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'entries', entryId));
      toast.success('Entry deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/entries">
          <Button variant="ghost" className="flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Entries
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Entry Details</h1>
        <p className="text-muted-foreground">{entry.date}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {entry.minutes} minutes
              </CardTitle>
              <CardDescription>
                Created on {entry.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/new?date=${entry.date}`}>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What worked on */}
          <div>
            <h3 className="font-semibold mb-2">What I worked on</h3>
            <p className="text-muted-foreground">{entry.workedOn || 'No description provided'}</p>
          </div>

          <Separator />

          {/* Languages */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Code className="h-4 w-4" />
              Languages Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.languages && entry.languages.length > 0 ? (
                entry.languages.map(lang => (
                  <Badge key={lang} variant="secondary">
                    {lang}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No languages specified</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Tools */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tools Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.tools && entry.tools.length > 0 ? (
                entry.tools.map(tool => (
                  <Badge key={tool} variant="outline">
                    {tool}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No tools specified</p>
              )}
            </div>
          </div>

          <Separator />

          {/* What learned */}
          <div>
            <h3 className="font-semibold mb-2">What I learned</h3>
            <p className="text-muted-foreground">{entry.learned || 'No learnings recorded'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
