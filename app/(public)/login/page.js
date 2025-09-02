'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.email.split('@')[0],
          email: user.email,
          createdAt: new Date(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          goalDays: 30
        });
        
        // Initialize user preferences with default tools and languages
        const defaultLanguages = [
          { name: "JavaScript", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "TypeScript", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Python", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Java", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "C++", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "C#", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Go", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Rust", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "PHP", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Ruby", count: 0, lastUsed: new Date(), isFavorite: false }
        ];

        const defaultTools = [
          { name: "VS Code", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "IntelliJ", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Git", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Docker", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "AWS", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Firebase", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Next.js", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "React", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Vue", count: 0, lastUsed: new Date(), isFavorite: false },
          { name: "Angular", count: 0, lastUsed: new Date(), isFavorite: false }
        ];

        await setDoc(doc(db, 'userPreferences', user.uid), {
          uid: user.uid,
          commonLanguages: defaultLanguages,
          commonTools: defaultTools,
          lastUpdated: new Date()
        });
        
        toast.success('Account created successfully!');
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      }
      
      // Don't redirect here - let AuthContext handle it
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">30-Day Coding Challenge</CardTitle>
          <CardDescription>
            Track your daily progress and stay motivated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
