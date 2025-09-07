"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, PencilRuler } from "lucide-react";

export default function EntriesPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper to fetch entries for the current user
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "entries"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(data);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError("Failed to load entries. See console for details.");
    } finally {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, fetchEntries]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">Your Coding Challenge Entries</h1>
      <p className="text-muted-foreground mb-8">
        View all your daily coding logs below.
      </p>
      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      )}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && entries.length === 0 && (
        <div className="text-muted-foreground">
          No entries found. Start logging your coding progress!
        </div>
      )}
      <div className="space-y-6">
        {entries
          .sort((a, b) => b.date.localeCompare(a.date)) // newest first
          .map((entry) => (
            <Card key={entry.id || entry.date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />

                  <span>{format(parseISO(entry.date), "MMMM d, yyyy")}</span>
                </CardTitle>
                <CardDescription>{entry.minutes} minutes coded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex items-center gap-2">
                  <PencilRuler className="h-4 w-4" />
                  <span className="font-semibold">What you worked on:</span>
                </div>
                <div className="ml-2">
                  {entry.workedOn || (
                    <span className="text-muted-foreground">No details</span>
                  )}
                </div>
                <div className="my-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Tools Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    
                    {entry.tools && entry.tools.length > 0 ? (
                      entry.tools.map((tool) => (
                        <Badge key={tool} variant="outline">
                          {tool}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No tools specified
                      </p>
                    )}
                  </div>
                </div>
                {entry.notes && (
                  <div>
                    <span className="font-semibold">Notes:</span>
                    <div className="ml-2">{entry.notes}</div>
                  </div>
                )}
                <Link href={`/entries/${entry.id}`}>
                  <Button size="sm" className="mt-2 hover:cursor-pointer">
                    Edit entry
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
