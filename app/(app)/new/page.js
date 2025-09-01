'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { X } from 'lucide-react';

// Common languages and tools for quick selection
const commonLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin'];
const commonTools = ['VS Code', 'IntelliJ', 'Git', 'Docker', 'AWS', 'Firebase', 'Next.js', 'React', 'Vue', 'Angular', 'Node.js', 'PostgreSQL'];

export default function NewEntryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    minutes: '',
    workedOn: '',
    languages: [],
    tools: [],
    learned: ''
  });

  const [customLanguage, setCustomLanguage] = useState('');
  const [customTool, setCustomTool] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const entryId = `${user?.uid}_${today}`;

  
  const loadTodayEntry = useCallback(async () => {
    try {
      setLoading(true);
      const entryDoc = await getDoc(doc(db, 'entries', entryId));
      if (entryDoc.exists()) {
        const data = entryDoc.data();
        setFormData({
          minutes: data.minutes?.toString() || '',
          workedOn: data.workedOn || '',
          languages: data.languages || [],
          tools: data.tools || [],
          learned: data.learned || ''
        });
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      toast.error('Failed to load today&apos;s entry');
    } finally {
      setLoading(false);
    }
  }, [entryId]);
  
  useEffect(() => {
    if (user) {
      loadTodayEntry();
    }
  }, [user, loadTodayEntry]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.minutes || formData.minutes < 0) {
      toast.error('Please enter valid minutes');
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'entries', entryId), {
        uid: user.uid,
        date: today,
        minutes: parseInt(formData.minutes),
        workedOn: formData.workedOn,
        languages: formData.languages,
        tools: formData.tools,
        learned: formData.learned,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast.success('Entry saved successfully! 🎉');
      
      // Trigger confetti animation
      if (typeof window !== 'undefined') {
        const confetti = require('canvas-confetti');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const addLanguage = (language) => {
    if (language && !formData.languages.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }));
    }
    setCustomLanguage('');
  };

  const removeLanguage = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addTool = (tool) => {
    if (tool && !formData.tools.includes(tool)) {
      setFormData(prev => ({
        ...prev,
        tools: [...prev.tools, tool]
      }));
    }
    setCustomTool('');
  };

  const removeTool = (tool) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t !== tool)
    }));
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Log Today&apos;s Progress</h1>
        <p className="text-muted-foreground">
          {today} • {formData.minutes ? 'Editing today&apos;s entry' : 'New entry'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Coding Log</CardTitle>
          <CardDescription>
            Track what you worked on, learned, and the tools you used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Minutes */}
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes Coded Today</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                step="5"
                value={formData.minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, minutes: e.target.value }))}
                placeholder="e.g., 90"
                required
              />
            </div>

            {/* What worked on */}
            <div className="space-y-2">
              <Label htmlFor="workedOn">What did you work on?</Label>
              <Textarea
                id="workedOn"
                value={formData.workedOn}
                onChange={(e) => setFormData(prev => ({ ...prev, workedOn: e.target.value }))}
                placeholder="Describe what you built, fixed, or learned..."
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.workedOn.length}/500 characters
              </p>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>Languages Used</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {commonLanguages.map(lang => (
                    <Button
                      key={lang}
                      type="button"
                      variant={formData.languages.includes(lang) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (formData.languages.includes(lang)) {
                          removeLanguage(lang);
                        } else {
                          addLanguage(lang);
                        }
                      }}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom language..."
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLanguage(customLanguage);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addLanguage(customLanguage)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map(lang => (
                    <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                      {lang}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeLanguage(lang)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-2">
              <Label>Tools Used</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {commonTools.map(tool => (
                    <Button
                      key={tool}
                      type="button"
                      variant={formData.tools.includes(tool) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (formData.tools.includes(tool)) {
                          removeTool(tool);
                        } else {
                          addTool(tool);
                        }
                      }}
                    >
                      {tool}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tool..."
                    value={customTool}
                    onChange={(e) => setCustomTool(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTool(customTool);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTool(customTool)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tools.map(tool => (
                    <Badge key={tool} variant="outline" className="flex items-center gap-1">
                      {tool}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTool(tool)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* What learned */}
            <div className="space-y-2">
              <Label htmlFor="learned">What did you learn?</Label>
              <Textarea
                id="learned"
                value={formData.learned}
                onChange={(e) => setFormData(prev => ({ ...prev, learned: e.target.value }))}
                placeholder="Share your key learnings, insights, or discoveries..."
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.learned.length}/500 characters
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
