// This is a test page

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import WordcloudGenerator from "@/components/graphical/WordcloudGenerator";
import { ParentSize } from "@visx/responsive";

export default function WordcloudPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch entries
      const entriesQuery = query(
        collection(db, "entries"),
        where("uid", "==", user.uid),
        orderBy("date", "desc")
      );
      const entriesSnapshot = await getDocs(entriesQuery);
      const entriesData = entriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(entriesData);
      console.log("Entries data:", entries);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Get tools distribution
  const languages = entries.reduce((acc, entry) => {
    if (entry.tools) {
      entry.tools.forEach((tool) => {
        acc[tool] = (acc[tool] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const toolData = Object.entries(languages).map(([lang, count]) => ({
    text: lang,
    value: count,
  }));

  console.log("Tool data:", toolData);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto">
      <h1 className="text-2xl font-bold">Used tools</h1>
      <div style={{ width: "100%", height: 400 }}>
        <ParentSize>
          {({ width, height }) =>
            width > 0 && height > 0 ? (
              <WordcloudGenerator
                width={width}
                height={height}
                showControls={false}
                data={toolData}
                rotation={false}
                typeOfSpiral="archimedean"
              />
            ) : null
          }
        </ParentSize>
      </div>
    </div>
  );
}
