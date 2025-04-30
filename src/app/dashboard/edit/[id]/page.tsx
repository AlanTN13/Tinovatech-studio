'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import ContentForm from '@/components/content/ContentForm';
import type { ContentItem } from '@/types/contentItem'; // Import the type
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to safely convert Firestore Timestamp or Date string to YYYY-MM-DD or return null
const formatSuggestedDate = (dateField: unknown): string | null => {
    let date: Date | null = null;
    if (dateField instanceof Timestamp) {
        date = dateField.toDate();
    } else if (typeof dateField === 'string') {
         // Handle 'YYYY-MM-DD' string directly or try parsing other date strings
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateField)) {
             try {
                 // Using UTC to be consistent when creating the Date object
                 date = new Date(dateField + 'T00:00:00Z');
                 if (isNaN(date.getTime())) { date = null; }
             } catch (e) { date = null; }
        } else {
             try {
                date = new Date(dateField);
                if (isNaN(date.getTime())) { date = null; }
            } catch (e) { date = null; }
        }
    } else if (dateField instanceof Date){
         date = dateField; // Already a Date object
    }

    if (date instanceof Date && !isNaN(date.getTime())) {
         // Format to YYYY-MM-DD in UTC
         const year = date.getUTCFullYear();
         const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
         const day = date.getUTCDate().toString().padStart(2, '0');
         return `${year}-${month}-${day}`;
    }
    return null;
}


export default function EditContentPage(): ReactElement {
  const params = useParams();
  const id = params?.id as string | undefined; // Get ID from route params
  const [initialData, setInitialData] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
        setError("Content ID is missing.");
        setLoading(false);
        return;
    };

    const fetchContentItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'contentItems', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const rawData = docSnap.data();
            const formattedData = {
                id: docSnap.id,
                title: rawData.title ?? '',
                description: rawData.description,
                fileUrl: rawData.fileUrl ?? '',
                category: rawData.category ?? '',
                suggestedDate: formatSuggestedDate(rawData.suggestedDate) ?? undefined, // Format to YYYY-MM-DD or undefined
                status: rawData.status ?? 'draft',
                comments: rawData.comments,
                // createdAt/updatedAt are not typically needed for the form's initial data
            } as ContentItem;
            setInitialData(formattedData);
        } else {
          console.log('No such document!');
          setError('Content item not found.');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load content item.');
      } finally {
        setLoading(false);
      }
    };

    fetchContentItem();
  }, [id]);

  if (loading) {
      return (
         <div className="max-w-2xl mx-auto space-y-6 p-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
      );
  }

  if (error) {
      return <div className="text-center text-destructive py-10">{error}</div>;
  }

  if (!initialData) {
     // This case might happen briefly or if fetch failed silently before setting error
     return <div className="text-center text-muted-foreground py-10">Could not load content data.</div>;
  }


  return (
    <div>
      <ContentForm initialData={initialData} isEditing={true} />
    </div>
  );
}
