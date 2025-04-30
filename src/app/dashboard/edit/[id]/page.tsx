'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import ContentForm from '@/components/content/ContentForm';
import type { ContentItem } from '@/types/contentItem'; // Import the type
import { Skeleton } from "@/components/ui/skeleton";


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
            const data = { id: docSnap.id, ...docSnap.data() } as ContentItem;
             // Ensure suggestedDate is correctly formatted if it exists and is a Timestamp
            if (data.suggestedDate && typeof data.suggestedDate === 'object' && 'toDate' in data.suggestedDate) {
               data.suggestedDate = (data.suggestedDate as any).toDate().toISOString().split('T')[0];
            }
            setInitialData(data);
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
