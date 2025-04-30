'use client';

import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import ContentCard from '@/components/content/ContentCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import type { ContentItem } from '@/types/contentItem'; // Import the type
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to safely convert Firestore Timestamp to ISO string or return null
const timestampToISOString = (timestamp: unknown): string | null => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
     // Attempt to parse if it's already a string representation of a date
     try {
       return new Date(timestamp).toISOString();
     } catch (e) {
       return null; // Invalid date string
     }
  }
  // Handle cases where it might be stored as { seconds: number, nanoseconds: number }
  if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp && 'nanoseconds' in timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
      try {
          return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate().toISOString();
      } catch (e) {
          return null;
      }
  }
  return null; // Return null for undefined, null, or other types
};

// Helper function to safely convert Firestore Timestamp or Date string to YYYY-MM-DD or return null
const formatSuggestedDate = (dateField: unknown): string | null => {
    let date: Date | null = null;
    if (dateField instanceof Timestamp) {
        date = dateField.toDate();
    } else if (typeof dateField === 'string') {
         // Handle 'YYYY-MM-DD' string directly or try parsing other date strings
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateField)) {
            // Add time part to avoid potential timezone issues when creating Date object
            // Using UTC to be consistent
             try {
                date = new Date(dateField + 'T00:00:00Z');
                 if (isNaN(date.getTime())) { // Check if date is valid
                    date = null;
                 }
             } catch (e) {
                 date = null;
             }

        } else {
             try {
                date = new Date(dateField);
                if (isNaN(date.getTime())) { // Check if date is valid
                   date = null;
                }
            } catch (e) {
                date = null;
            }
        }

    } else if (dateField instanceof Date){
         date = dateField; // Already a Date object
    }

    if (date instanceof Date && !isNaN(date.getTime())) {
         // Format to YYYY-MM-DD in UTC to avoid timezone shifts affecting the date part
         const year = date.getUTCFullYear();
         const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
         const day = date.getUTCDate().toString().padStart(2, '0');
         return `${year}-${month}-${day}`;
    }
    return null;
}

// Example Content Items
const exampleContentItems: ContentItem[] = [
    {
        id: 'example-1',
        title: 'Lanzamiento Nueva Web',
        description: '¡Estamos emocionados de anunciar el lanzamiento de nuestra nueva página web! Visítala ahora.',
        fileUrl: 'https://picsum.photos/seed/lanzamiento/400/300',
        category: 'branding',
        suggestedDate: '2024-08-15',
        status: 'published',
        comments: 'Post principal de la campaña de lanzamiento.',
        createdAt: new Date('2024-07-10T10:00:00Z').toISOString(),
        updatedAt: new Date('2024-07-12T15:30:00Z').toISOString(),
    },
    {
        id: 'example-2',
        title: 'Promo Verano 20% OFF',
        description: 'Aprovecha nuestro descuento del 20% en todos los servicios durante el mes de agosto.',
        fileUrl: 'https://picsum.photos/seed/promo/400/300',
        category: 'promociones',
        suggestedDate: '2024-08-01',
        status: 'approved',
        comments: 'Revisar copy final antes de publicar.',
        createdAt: new Date('2024-07-20T09:00:00Z').toISOString(),
        updatedAt: new Date('2024-07-25T11:00:00Z').toISOString(),
    },
    {
        id: 'example-3',
        title: 'Tip: Optimiza tu SEO Local',
        description: 'Mejora tu visibilidad en búsquedas locales con estos 5 sencillos pasos.',
        fileUrl: 'https://picsum.photos/seed/tip/400/300',
        category: 'tips',
        suggestedDate: '2024-08-22',
        status: 'draft',
        createdAt: new Date('2024-07-28T14:00:00Z').toISOString(),
        updatedAt: new Date('2024-07-28T14:00:00Z').toISOString(),
    },
];


const fetchContentItems = async (): Promise<ContentItem[]> => {
  let contentList: ContentItem[] = [];
  try {
      const contentCollection = collection(db, 'contentItems');
      const contentSnapshot = await getDocs(contentCollection);
      contentList = contentSnapshot.docs.map(doc => {
         const data = doc.data();
         return {
            id: doc.id,
            title: data.title ?? '',
            description: data.description,
            fileUrl: data.fileUrl ?? '',
            category: data.category ?? '',
            // Safely format suggestedDate to YYYY-MM-DD string or null
            suggestedDate: formatSuggestedDate(data.suggestedDate) ?? undefined,
            status: data.status ?? 'draft',
            comments: data.comments,
            // Safely convert Timestamps to ISO strings or null
            createdAt: timestampToISOString(data.createdAt),
            updatedAt: timestampToISOString(data.updatedAt),
         } as ContentItem; // Cast to ContentItem
      });
  } catch (error) {
      console.error("Error fetching content from Firestore:", error);
      // Optionally return empty or throw error, decided to proceed and add examples if empty
  }


  // If Firestore is empty or fetch failed, add example items
  if (contentList.length === 0) {
      console.log("No content found in Firestore, showing example items.");
      contentList.push(...exampleContentItems);
  }

  // Sort by suggestedDate descending (treat null/undefined dates as oldest)
  contentList.sort((a, b) => {
    const dateA = a.suggestedDate ? new Date(a.suggestedDate).getTime() : 0;
    const dateB = b.suggestedDate ? new Date(b.suggestedDate).getTime() : 0;
    if (dateA === 0 && dateB === 0) return 0; // Both dates invalid/missing
    if (dateA === 0) return 1; // a is older (no date)
    if (dateB === 0) return -1; // b is older (no date)
    return dateB - dateA; // Sort by date descending
  });

  return contentList;
};


export default function DashboardPage(): ReactElement {
  const { data: contentItems, isLoading, error, refetch } = useQuery<ContentItem[]>({
      queryKey: ['contentItems'],
      queryFn: fetchContentItems
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Refetch data when component mounts or filters change if desired (optional)
  // useEffect(() => {
  //   refetch();
  // }, [refetch]);


  const filteredContentItems = useMemo(() => {
    return contentItems?.filter(item => {
      const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      const searchMatch = searchTerm === '' ||
                          (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return categoryMatch && statusMatch && searchMatch;
    }) ?? [];
  }, [contentItems, filterCategory, filterStatus, searchTerm]);

  const categories = useMemo(() => {
    // Ensure examples are included if contentItems is initially empty
    const allItems = contentItems?.length ? contentItems : exampleContentItems;
    const uniqueCategories = new Set(allItems?.map(item => item.category).filter(Boolean) ?? []);
    const translatedCategories = Array.from(uniqueCategories).map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1) // Simple capitalization
    }));
    return [{ value: 'all', label: 'Todas las Categorías' }, ...translatedCategories];
  }, [contentItems]);

  const statuses = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'published', label: 'Publicado' },
  ];

   const getStatusLabel = (value: ContentItem['status']): string => {
       const status = statuses.find(s => s.value === value);
       return status ? status.label : value; // Fallback to value if not found
   };

  if (isLoading) return (
     <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-48" />
        </div>
         <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg border shadow-sm">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
        </div>
    </div>
  );
  // Display a specific error message if the query fails
  // Don't show error if it was just Firestore being empty and we fell back to examples
  if (error && contentItems?.length === 0) return (
      <div className="container mx-auto py-8 text-center text-destructive">
        <h2 className="text-xl font-semibold mb-2">Error al cargar el contenido</h2>
        <p>No se pudo obtener la información de Firestore.</p>
        <p className="text-sm mt-1">Detalles: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">Reintentar</Button>
      </div>
  );

 // Handle case where data is fetched but empty (this case is now handled by showing examples)
 // We modify this to show the "no matching filters" message if applicable,
 // or the generic "no content" message only if examples are somehow missing AND firestore empty.
 // The primary "no content" message is now less likely due to examples.
 if (!isLoading && !error && !filteredContentItems?.length && (searchTerm || filterCategory !== 'all' || filterStatus !== 'all')) {
    // Show message only when filters are active and result is empty
 } else if (!isLoading && !error && !contentItems?.length) {
    // This case should ideally not be reached due to example data fallback,
    // but included as a safeguard if examples were removed or fetchContentItems logic changes.
    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Panel de Contenido</h1>
                <Link href="/dashboard/new" passHref>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Contenido
                    </Button>
                </Link>
            </div>
            <div className="text-center py-10 text-muted-foreground">
                Aún no hay contenido. ¡Crea tu primer elemento!
            </div>
        </div>
    );
 }


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Panel de Contenido</h1>
         <Link href="/dashboard/new" passHref>
             <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Contenido
             </Button>
         </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg border shadow-sm">
         <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar por título o descripción..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {filteredContentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContentItems.map((item) => (
            <ContentCard key={item.id} contentItem={{...item, statusLabel: getStatusLabel(item.status)}} />
          ))}
        </div>
      ) : (
         <div className="text-center py-10 text-muted-foreground">
             {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                 ? "No se encontraron elementos de contenido que coincidan con sus criterios de búsqueda o filtros."
                 : "Aún no hay contenido para mostrar." // Fallback if examples failed AND Firestore empty
             }
         </div>
      )}
    </div>
  );
}
