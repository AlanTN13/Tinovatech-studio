'use client';

import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import ContentCard from '@/components/content/ContentCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import type { ContentItem } from '@/types/contentItem'; // Import the type
import { Skeleton } from '@/components/ui/skeleton';

const fetchContentItems = async (): Promise<ContentItem[]> => {
  const contentCollection = collection(db, 'contentItems');
  const contentSnapshot = await getDocs(contentCollection);
  const contentList = contentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Ensure suggestedDate is converted if stored as Timestamp
    suggestedDate: doc.data().suggestedDate?.toDate ? doc.data().suggestedDate.toDate().toISOString().split('T')[0] : doc.data().suggestedDate,
  } as ContentItem));
  // Sort by suggestedDate descending initially
  contentList.sort((a, b) => {
    const dateA = a.suggestedDate ? new Date(a.suggestedDate).getTime() : 0;
    const dateB = b.suggestedDate ? new Date(b.suggestedDate).getTime() : 0;
    return dateB - dateA;
  });
  return contentList;
};


export default function DashboardPage(): ReactElement {
  const { data: contentItems, isLoading, error } = useQuery<ContentItem[]>({
      queryKey: ['contentItems'],
      queryFn: fetchContentItems
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredContentItems = useMemo(() => {
    return contentItems?.filter(item => {
      const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      const searchMatch = searchTerm === '' ||
                          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return categoryMatch && statusMatch && searchMatch;
    }) ?? [];
  }, [contentItems, filterCategory, filterStatus, searchTerm]);

  const categories = useMemo(() => {
    // Translate categories for display
    const uniqueCategories = new Set(contentItems?.map(item => item.category) ?? []);
    const translatedCategories = Array.from(uniqueCategories).map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1) // Simple capitalization for now
    }));
    // Add "All Categories" option
    return [{ value: 'all', label: 'Todas las Categorías' }, ...translatedCategories];
  }, [contentItems]);

  const statuses = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'published', label: 'Publicado' },
  ];

   const getStatusLabel = (value: string): string => {
       const status = statuses.find(s => s.value === value);
       return status ? status.label : value;
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
  if (error) return <div>Error al cargar el contenido: {error.message}</div>;

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
            No se encontraron elementos de contenido que coincidan con sus criterios.
        </div>
      )}
    </div>
  );
}
