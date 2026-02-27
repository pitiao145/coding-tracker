'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { X, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_DEMO_PREFERENCES = {
  commonLanguages: [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby"
  ].map(name => ({ name, count: 0, lastUsed: null, isFavorite: false })),
  commonTools: [
    "VS Code", "IntelliJ", "Git", "Docker", "AWS", "Firebase", "Next.js", "React", "Vue", "Angular"
  ].map(name => ({ name, count: 0, lastUsed: null, isFavorite: false }))
};

export default function NewEntryPage({ demoMode }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    minutes: '',
    workedOn: '',
    languages: [],
    tools: [],
    learned: ''
  });

  const [customLanguage, setCustomLanguage] = useState('');
  const [customTool, setCustomTool] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    commonLanguages: [],
    commonTools: []
  });

  // Initialize date from URL params or default to today
  const [selectedDate, setSelectedDate] = useState(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      return dateParam;
    }
    return format(new Date(), 'yyyy-MM-dd');
  });
  
  // Generate entry ID based on selected date
  const entryId = user ? `${user.uid}_${selectedDate}` : '';
  // Load user preferences
  const loadUserPreferences = useCallback(async () => {
    if (!user) return;
    if (demoMode) {
      setUserPreferences(DEFAULT_DEMO_PREFERENCES);
      return;
    }
    try {
      const prefsDoc = await getDoc(doc(db, 'userPreferences', user.uid));
      if (prefsDoc.exists()) {
        const data = prefsDoc.data();
        setUserPreferences({
          commonLanguages: data.commonLanguages || [],
          commonTools: data.commonTools || []
        });
      } else {
        // Initialize with default preferences if none exist
        const defaultLanguages = [
          "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby"
        ];
        const defaultTools = [
          "VS Code", "IntelliJ", "Git", "Docker", "AWS", "Firebase", "Next.js", "React", "Vue", "Angular"
        ];
        
        const defaultPrefs = {
          uid: user.uid,
          commonLanguages: defaultLanguages.map(lang => ({
            name: lang,
            count: 0,
            lastUsed: null,
            isFavorite: false
          })),
          commonTools: defaultTools.map(tool => ({
            name: tool,
            count: 0,
            lastUsed: null,
            isFavorite: false
          })),
          lastUpdated: new Date()
        };
        
        try {
          await setDoc(doc(db, 'userPreferences', user.uid), defaultPrefs);
          setUserPreferences(defaultPrefs);
          console.log('Created default preferences successfully');
        } catch (createError) {
          console.error('Failed to create preferences:', createError);
          // If creation fails, set empty preferences to prevent errors
          setUserPreferences({
            commonLanguages: [],
            commonTools: []
          });
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      // Set empty preferences to prevent crashes
      setUserPreferences({
        commonLanguages: [],
        commonTools: []
      });
    }
  }, [user, demoMode]);

  // Load entry for selected date
  const loadEntry = useCallback(async () => {
    if (!user || !selectedDate) return;
    if (demoMode) {
      setFormData({ minutes: '', workedOn: '', languages: [], tools: [], learned: '' });
      setIsEditing(false);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const entryDoc = await getDoc(doc(db, 'entries', entryId));
      if (entryDoc.exists()) {
        console.log('Entry found');
        const data = entryDoc.data();
        setFormData({
          minutes: data.minutes?.toString() || '',
          workedOn: data.workedOn || '',
          languages: data.languages || [],
          tools: data.tools || [],
          learned: data.learned || ''
        });
        setIsEditing(true);
      } else {
        // Clear form for new entry
        console.log('Entry not found, clearing form');
        setFormData({
          minutes: '',
          workedOn: '',
          languages: [],
          tools: [],
          learned: ''
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      toast.error('Failed to load entry for selected date');
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate, entryId, searchParams, demoMode]);

  // Handle date changes
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // Clear form when date changes
    setFormData({
      minutes: '',
      workedOn: '',
      languages: [],
      tools: [],
      learned: ''
    });
    setIsEditing(false);
  };

  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadEntry();
    }
  }, [user, loadUserPreferences, loadEntry, searchParams]);

  // Handle URL parameter changes
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam && dateParam !== selectedDate) {
      setSelectedDate(dateParam);
      // Clear form when date changes from URL
      setFormData({
        minutes: '',
        workedOn: '',
        languages: [],
        tools: [],
        learned: ''
      });
    }
  }, [searchParams, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.minutes || formData.minutes < 0) {
      toast.error('Please enter valid minutes');
      return;
    }

    setSaving(true);
    try {
      if (demoMode) {
        toast.success(isEditing ? 'Entry updated successfully! 🎉' : 'Entry created successfully! 🎉');
        if (typeof window !== 'undefined') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setTimeout(() => router.push('/demo'), 1500);
      } else {
        await setDoc(doc(db, 'entries', entryId), {
          uid: user.uid,
          date: selectedDate,
          minutes: parseInt(formData.minutes),
          workedOn: formData.workedOn,
          languages: formData.languages,
          tools: formData.tools,
          learned: formData.learned,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await updateUsageCounts(formData.languages, formData.tools);
        toast.success(isEditing ? 'Entry updated successfully! 🎉' : 'Entry created successfully! 🎉');
        if (typeof window !== 'undefined') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        setTimeout(() => router.push('/dashboard'), 1500);
      }
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

  const toggleFavorite = async (type, name) => {
    if (demoMode) {
      if (type === 'language') {
        setUserPreferences(prev => ({
          ...prev,
          commonLanguages: prev.commonLanguages.map(lang =>
            lang.name === name ? { ...lang, isFavorite: !lang.isFavorite } : lang
          )
        }));
      } else {
        setUserPreferences(prev => ({
          ...prev,
          commonTools: prev.commonTools.map(tool =>
            tool.name === name ? { ...tool, isFavorite: !tool.isFavorite } : tool
          )
        }));
      }
      toast.success(`${name} ${type === 'language' ? 'language' : 'tool'} favorited!`);
      return;
    }
    try {
      const prefsRef = doc(db, 'userPreferences', user.uid);
      const currentPrefs = userPreferences;
      
      if (type === 'language') {
        const updatedLanguages = currentPrefs.commonLanguages.map(lang => 
          lang.name === name ? { ...lang, isFavorite: !lang.isFavorite } : lang
        );
        
        // Sort: favorites first, then by count, then by lastUsed
        const sortedLanguages = updatedLanguages.sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
          if (a.count !== b.count) return b.count - a.count;
          return new Date(b.lastUsed) - new Date(a.lastUsed);
        }).slice(0, 10); // Keep only top 10
        
        await updateDoc(prefsRef, { commonLanguages: sortedLanguages });
        setUserPreferences(prev => ({ ...prev, commonLanguages: sortedLanguages }));
      } else {
        const updatedTools = currentPrefs.commonTools.map(tool => 
          tool.name === name ? { ...tool, isFavorite: !tool.isFavorite } : tool
        );
        
        // Sort: favorites first, then by count, then by lastUsed
        const sortedTools = updatedTools.sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
          if (a.count !== b.count) return b.count - a.count;
          return new Date(b.lastUsed) - new Date(a.lastUsed);
        }).slice(0, 10); // Keep only top 10
        
        await updateDoc(prefsRef, { commonTools: sortedTools });
        setUserPreferences(prev => ({ ...prev, commonTools: sortedTools }));
      }
      
      toast.success(`${name} ${type === 'language' ? 'language' : 'tool'} favorited!`);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const addCustomItem = async (type, name) => {
    if (!name.trim()) return;
    if (demoMode) {
      const newItem = { name: name.trim(), count: 1, lastUsed: new Date(), isFavorite: false };
      if (type === 'language') {
        setUserPreferences(prev => ({
          ...prev,
          commonLanguages: [...prev.commonLanguages, newItem].slice(-10)
        }));
        addLanguage(name.trim());
      } else {
        setUserPreferences(prev => ({
          ...prev,
          commonTools: [...prev.commonTools, newItem].slice(-10)
        }));
        addTool(name.trim());
      }
      toast.success(`Added ${name} to your ${type === 'language' ? 'languages' : 'tools'}!`);
      return;
    }
    try {
      const prefsRef = doc(db, 'userPreferences', user.uid);
      const currentPrefs = userPreferences;
      
      if (type === 'language') {
        const newLanguage = {
          name: name.trim(),
          count: 1,
          lastUsed: new Date(),
          isFavorite: false
        };
        
        const updatedLanguages = [...currentPrefs.commonLanguages, newLanguage]
          .sort((a, b) => {
            if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
            if (a.count !== b.count) return b.count - a.count;
            return new Date(b.lastUsed) - new Date(a.lastUsed);
          })
          .slice(0, 10); // Keep only top 10
        
        await updateDoc(prefsRef, { commonLanguages: updatedLanguages });
        setUserPreferences(prev => ({ ...prev, commonLanguages: updatedLanguages }));
      } else {
        const newTool = {
          name: name.trim(),
          count: 1,
          lastUsed: new Date(),
          isFavorite: false
        };
        
        const updatedTools = [...currentPrefs.commonTools, newTool]
          .sort((a, b) => {
            if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
            if (a.count !== b.count) return b.count - a.count;
            return new Date(b.lastUsed) - new Date(a.lastUsed);
          })
          .slice(0, 10); // Keep only top 10
        
        await updateDoc(prefsRef, { commonTools: updatedTools });
        setUserPreferences(prev => ({ ...prev, commonTools: updatedTools }));
      }
      
      if (type === 'language') {
        addLanguage(name.trim());
      } else {
        addTool(name.trim());
      }
      
      toast.success(`Added ${name} to your ${type === 'language' ? 'languages' : 'tools'}!`);
    } catch (error) {
      console.error('Error adding custom item:', error);
      toast.error('Failed to add custom item');
    }
  };

  const updateUsageCounts = async (languages, tools) => {
    try {
      const prefsRef = doc(db, 'userPreferences', user.uid);
      const currentPrefs = userPreferences;
      
      // Update language counts
      const updatedLanguages = currentPrefs.commonLanguages.map(lang => {
        if (languages.includes(lang.name)) {
          return {
            ...lang,
            count: lang.count + 1,
            lastUsed: new Date()
          };
        }
        return lang;
      });
      
      // Update tool counts
      const updatedTools = currentPrefs.commonTools.map(tool => {
        if (tools.includes(tool.name)) {
          return {
            ...tool,
            count: tool.count + 1,
            lastUsed: new Date()
          };
        }
        return tool;
      });
      
      // Sort and limit to top 10
      const sortedLanguages = updatedLanguages
        .sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
          if (a.count !== b.count) return b.count - a.count;
          return new Date(b.lastUsed) - new Date(a.lastUsed);
        })
        .slice(0, 10);
      
      const sortedTools = updatedTools
        .sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
          if (a.count !== b.count) return b.count - a.count;
          return new Date(b.lastUsed) - new Date(a.lastUsed);
        })
        .slice(0, 10);
      
      // Update preferences
      await updateDoc(prefsRef, {
        commonLanguages: sortedLanguages,
        commonTools: sortedTools,
        lastUpdated: new Date()
      });
      
      // Update local state
      setUserPreferences(prev => ({
        ...prev,
        commonLanguages: sortedLanguages,
        commonTools: sortedTools
      }));
    } catch (error) {
      console.error('Error updating usage counts:', error);
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

  // Helper functions for page title and description
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const isPastDate = selectedDate < format(new Date(), 'yyyy-MM-dd');
  const isFutureDate = selectedDate > format(new Date(), 'yyyy-MM-dd');

  const getPageTitle = () => {
    if (isToday) {
      return isEditing ? "Edit Today's Progress" : "Log Today's Progress";
    }
    if (isPastDate) {
      return isEditing ? "Edit Past Progress" : "Log Past Progress";
    }
    if (isFutureDate) {
      return isEditing ? "Edit Future Progress" : "Log Future Progress";
    }
    return isEditing ? "Edit Progress" : "Log Progress";
  };

  const getPageDescription = () => {
    if (isToday) {
      return `${selectedDate} • ${isEditing ? 'Editing today\'s entry' : 'New entry'}`;
    }
    if (isPastDate) {
      return `${selectedDate} • ${isEditing ? 'Editing existing entry' : 'New entry for past date'}`;
    }
    if (isFutureDate) {
      return `${selectedDate} • ${isEditing ? 'Editing future entry' : 'New entry for future date'}`;
    }
    return `${selectedDate} • ${isEditing ? 'Editing entry' : 'New entry'}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {isEditing && <div className="mb-6">
          <Link href={demoMode ? `/demo/entries/${entryId}` : `/entries/${entryId}`}>
            <Button variant="ghost" className="flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Entry
            </Button>
          </Link>
        </div>}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
        <p className="text-muted-foreground">
          {getPageDescription()}
        </p>
        
        {/* Date Picker */}
        <div className="mt-4">
          <Label htmlFor="date-picker">Select Date</Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')} // Prevent future dates for now
            className={`mt-2 max-w-xs ${isEditing ? 'cursor-not-allowed' : ''}`}
            disabled={isEditing}
          />
          {isToday && (
            <p className="text-xs text-muted-foreground mt-1">
              📅 Currently viewing today&apos;s entry
            </p>
          )}
          {isPastDate && (
            <p className="text-xs text-muted-foreground mt-1">
              📅 Viewing entry for {selectedDate}
            </p>
          )}
          {isEditing && (
            <p className="text-xs text-blue-500 font-medium mt-1">
              ✏️ Editing existing entry
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Daily Coding Log' : 'Daily Coding Log'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update your existing entry' : 'Track what you worked on, learned, and the tools you used'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Minutes */}
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes Coded {isToday ? 'Today' : 'on ' + selectedDate}</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                step="5"
                value={formData.minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, minutes: e.target.value }))}
                placeholder={isEditing ? "Update minutes..." : "e.g., 90"}
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
                placeholder={isEditing ? "Update what you worked on..." : "Describe what you built, fixed, or learned..."}
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
                  {userPreferences.commonLanguages.map(lang => (
                    <div className="relative group" key={lang.name}>
                      <Button
                        type="button"
                        variant={formData.languages.includes(lang.name) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (formData.languages.includes(lang.name)) {
                            removeLanguage(lang.name);
                          } else {
                            addLanguage(lang.name);
                          }
                        }}
                        className="pr-7" // add padding right for the star button
                      >
                        {lang.name}
                      </Button>
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={lang.isFavorite ? "Unfavorite" : "Favorite"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite('language', lang.name);
                        }}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                          lang.isFavorite 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-transparent text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                        }`}
                      >
                        <Star className={`h-3 w-3 ${lang.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={isEditing ? "Add new language..." : "Add custom language..."}
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem('language', customLanguage);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addCustomItem('language', customLanguage)}
                  >
                    {isEditing ? 'Add New' : 'Add'}
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
                  {userPreferences.commonTools.map(tool => (
                    <div className="relative group" key={tool.name}>
                      <Button
                        type="button"
                        variant={formData.tools.includes(tool.name) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (formData.tools.includes(tool.name)) {
                            removeTool(tool.name);
                          } else {
                            addTool(tool.name);
                          }
                        }}
                        className="pr-8" // add right padding for the favorite button
                      >
                        {tool.name}
                      </Button>
                      <span className="absolute right-1 top-1/2 -translate-y-1/2">
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite('tool', tool.name);
                          }}
                          className={`ml-2 p-1 rounded-full transition-colors ${
                            tool.isFavorite 
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                              : 'bg-transparent text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                          }`}
                        >
                          <Star className={`h-3 w-3 ${tool.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={isEditing ? "Add new tool..." : "Add custom tool..."}
                    value={customTool}
                    onChange={(e) => setCustomTool(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomItem('tool', customTool);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addCustomItem('tool', customTool)}
                  >
                    {isEditing ? 'Add New' : 'Add'}
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
                placeholder={isEditing ? "Update your learnings..." : "Share your key learnings, insights, or discoveries..."}
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
                className="flex-1 hover:cursor-pointer"
                disabled={saving}
              >
                {saving ? 'Saving...' : (isEditing ? 'Update Entry' : 'Save Entry')}
              </Button>
              <Button
                type="button"
                className="hover:cursor-pointer"
                variant="outline"
                onClick={() => router.push(demoMode ? '/demo' : '/dashboard')}
              >
                {isEditing ? 'Cancel Edit' : 'Cancel'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
