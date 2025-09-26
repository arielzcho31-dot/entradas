"use client";

import { useEffect, useState } from 'react';
import { getSuggestedContent } from '@/lib/actions';
import type { Event } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, ExternalLink, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface SuggestedContentProps {
  event: Event;
}

export default function SuggestedContent({ event }: SuggestedContentProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      const result = await getSuggestedContent({
        eventName: event.name,
        eventDescription: event.description,
        eventCategory: event.category,
      });

      if (result.success && result.data) {
        setSuggestions(result.data);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
      setLoading(false);
    };

    fetchSuggestions();
  }, [event]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Explore More</CardTitle>
                <CardDescription>AI-powered content to enhance your event experience.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-3/5" />
            </div>
             <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && suggestions.length > 0 && (
          <ul className="space-y-3">
            {suggestions.map((url, index) => (
              <li key={index}>
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  <span className="truncate">{url}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">No content suggestions available for this event.</p>
        )}
      </CardContent>
    </Card>
  );
}
