'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Target, TrendingUp, Code, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { format, subDays, startOfDay } from 'date-fns';

// Motivational quotes
const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Programming isn't about what you know; it's about what you can figure out.", author: "Chris Pine" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user data
      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
      if (!userDoc.empty) {
        setUserData(userDoc.docs[0].data());
      }


      // Fetch entries
      const entriesQuery = query(
        collection(db, 'entries'),
        where('uid', '==', user.uid),
        orderBy('date', 'desc')
      );
      const entriesSnapshot = await getDocs(entriesQuery);
      const entriesData = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(entriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);


  // Calculate metrics
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.minutes || 0), 0);
  const uniqueDays = new Set(entries.map(entry => entry.date)).size;
  const progressPercentage = Math.min(100, (uniqueDays / (userData?.goalDays || 30)) * 100);
  
  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    const entryDates = entries.map(e => e.date).sort().reverse();
    
    for (let i = 0; i < entryDates.length; i++) {
      const expectedDate = i === 0 ? today : format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (entryDates[i] === expectedDate || entryDates[i] === yesterday) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  
  const streak = calculateStreak();

  // Get today's entry
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = entries.find(entry => entry.date === today);

  // Get languages and tools distribution
  const languages = entries.reduce((acc, entry) => {
    if (entry.languages) {
      entry.languages.forEach(lang => {
        acc[lang] = (acc[lang] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const tools = entries.reduce((acc, entry) => {
    if (entry.tools) {
      entry.tools.forEach(tool => {
        acc[tool] = (acc[tool] || 0) + 1;
      });
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Hi, {userData?.displayName || user?.email?.split('@')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          &ldquo;{quote.text}&rdquo; — {quote.author}
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Progress
          </CardTitle>
          <CardDescription>
            {uniqueDays} of {userData?.goalDays || 30} days completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3 mb-4" />
          <p className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}% complete
          </p>
          <Link href="/entries">
            <Button size="sm" className="mt-2 hover:cursor-pointer">View Entries</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Coded</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEntry?.minutes || 0} min</div>
            {!todayEntry && (
              <Link href="/new">
                <Button size="sm" className="mt-2 hover:cursor-pointer">Log Today</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMinutes} min</div>
            <p className="text-xs text-muted-foreground">
              Across {uniqueDays} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it going! 🔥
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Languages and Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Languages Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(languages).map(([lang, count]) => (
                <Badge key={lang} variant="secondary">
                  {lang} ({count})
                </Badge>
              ))}
              {Object.keys(languages).length === 0 && (
                <p className="text-muted-foreground">No languages logged yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Tools Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tools).map(([tool, count]) => (
                <Badge key={tool} variant="outline">
                  {tool} ({count})
                </Badge>
              ))}
              {Object.keys(tools).length === 0 && (
                <p className="text-muted-foreground">No tools logged yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>What I Worked On</CardTitle>
            <CardDescription>Recent activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{entry.date}</p>
                  <Badge variant="secondary">{entry.minutes} min</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{entry.workedOn}</p>
                <Separator />
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-muted-foreground">No entries yet. Start your journey!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What I Learned</CardTitle>
            <CardDescription>Recent insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{entry.date}</p>
                  <Badge variant="secondary">{entry.minutes} min</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{entry.learned}</p>
                <Separator />
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-muted-foreground">No learnings logged yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
