'use client';

import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
// Firebase dependencies removed. Content is now served from local example data.
import ContentCard from '@/components/content/ContentCard';
import ContentListItem from '@/components/content/ContentListItem'; // Import List Item Component
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PlusCircle, Search, CalendarIcon, X, LayoutGrid, List, FileDown } from 'lucide-react'; // Added LayoutGrid, List, FileDown
import Link from 'next/link';
import type { ContentItem } from '@/types/contentItem'; // Import the type
import { exampleContentItems } from '@/data/exampleContent';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, startOfDay, isSameDay } from 'date-fns'; // Import date-fns functions
import { es } from 'date-fns/locale'; // Import Spanish locale
import { cn } from '@/lib/utils';

// Helper function to safely convert various timestamp formats to ISO string
const timestampToISOString = (timestamp: unknown): string | null => {
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  if (typeof timestamp === 'string') {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'seconds' in (timestamp as any) &&
    typeof (timestamp as any).seconds === 'number'
  ) {
    const ms = (timestamp as any).seconds * 1000;
    return new Date(ms).toISOString();
  }
  return null;
};

// Helper function to safely convert various date formats to YYYY-MM-DD
const formatSuggestedDate = (dateField: unknown): string | null => {
    let date: Date | null = null;
    if (typeof dateField === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateField)) {
             try {
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
         const year = date.getUTCFullYear();
         const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
         const day = date.getUTCDate().toString().padStart(2, '0');
         return `${year}-${month}-${day}`;
    }
    return null;
}

// Example content items are provided from '@/data/exampleContent'.


const fetchContentItems = async (): Promise<ContentItem[]> => {
  // Return local example items sorted by suggested date
  const contentList = [...exampleContentItems];
  contentList.sort((a, b) => {
    const dateA = a.suggestedDate ? parseISO(a.suggestedDate).getTime() : 0;
    const dateB = b.suggestedDate ? parseISO(b.suggestedDate).getTime() : 0;
    if (dateA === 0 && dateB === 0) return 0;
    if (dateA === 0) return 1;
    if (dateB === 0) return -1;
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
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined); // State for date filter
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards'); // State for view mode

  const filteredContentItems = useMemo(() => {
    return contentItems?.filter(item => {
      const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      const searchMatch = searchTerm === '' ||
                          (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Date match logic
      const dateMatch = !filterDate || (item.suggestedDate && isSameDay(parseISO(item.suggestedDate), filterDate));

      return categoryMatch && statusMatch && searchMatch && dateMatch;
    }) ?? [];
  }, [contentItems, filterCategory, filterStatus, searchTerm, filterDate]);

  const categories = useMemo(() => {
    const allItems = contentItems?.length ? contentItems : exampleContentItems;
    const uniqueCategories = new Set(allItems?.map(item => item.category).filter(Boolean) ?? []);
    const translatedCategories = Array.from(uniqueCategories).map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1)
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
       return status ? status.label : value;
   };

   // Placeholder function for Google Sheets export
   const handleExportToSheets = () => {
       // TODO: Implement Google Sheets export logic
       // 1. Format filteredContentItems into CSV or suitable format.
       // 2. Use Google Sheets API (or a library like SheetJS for client-side generation)
       //    to create or update a sheet.
       alert('Funcionalidad de exportar a Google Sheets aún no implementada.');
       console.log("Filtered items for export:", filteredContentItems);
   };

  if (isLoading) return (
     <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-48" />
        </div>
         <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg border shadow-sm flex-wrap">
            <Skeleton className="h-10 flex-1 min-w-[200px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[240px]" />
            <Skeleton className="h-10 w-10" /> {/* View toggle skeleton */}
            <Skeleton className="h-10 w-10" /> {/* View toggle skeleton */}
             <Skeleton className="h-10 w-32" /> {/* Export button skeleton */}
        </div>
        {/* Skeleton for Cards view */}
        {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        )}
        {/* Skeleton for List view */}
         {viewMode === 'list' && (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )}
    </div>
  );

  if (error && contentItems?.length === 0) return (
      <div className="container mx-auto py-8 text-center text-destructive">
        <h2 className="text-xl font-semibold mb-2">Error al cargar el contenido</h2>
        <p>No se pudo obtener la información.</p>
        <p className="text-sm mt-1">Detalles: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">Reintentar</Button>
      </div>
  );

 if (!isLoading && !error && !contentItems?.length) {
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 p-4 bg-card rounded-lg border shadow-sm flex-wrap items-center">
         {/* Search Input */}
         <div className="relative flex-grow min-w-[150px] sm:min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>

        {/* Category Filter */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[160px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Filter */}
         <div className="flex gap-2 items-center w-full sm:w-auto">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "flex-1 sm:flex-none sm:w-auto sm:min-w-[150px] justify-start text-left font-normal", // Adjusted width
                            !filterDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterDate ? format(filterDate, "PPP", { locale: es }) : <span>Fecha</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        locale={es}
                        mode="single"
                        selected={filterDate}
                        onSelect={setFilterDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {/* Clear Date Filter Button */}
            {filterDate && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFilterDate(undefined)}
                    className="h-10 w-10 shrink-0" // Match height
                    aria-label="Limpiar filtro de fecha"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 ml-auto border p-1 rounded-md">
            <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('cards')}
                aria-label="Vista de tarjetas"
            >
                <LayoutGrid className="h-4 w-4"/>
            </Button>
             <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="Vista de lista"
             >
                 <List className="h-4 w-4"/>
             </Button>
        </div>

         {/* Export Button */}
         <Button variant="outline" onClick={handleExportToSheets} className="w-full sm:w-auto">
            <FileDown className="mr-2 h-4 w-4" /> Exportar
         </Button>

      </div>


      {/* Content Display Area */}
      {filteredContentItems.length > 0 ? (
         <div>
            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContentItems.map((item) => (
                    <ContentCard key={item.id} contentItem={{...item, statusLabel: getStatusLabel(item.status)}} />
                ))}
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                   {/* List Header (Optional) */}
                   {/* <div className="flex items-center p-4 bg-muted/50 border-b text-sm font-medium">
                       <div className="w-1/3">Título</div>
                       <div className="w-1/6">Categoría</div>
                       <div className="w-1/6">Fecha Sug.</div>
                       <div className="w-1/6">Estado</div>
                       <div className="w-1/6 text-right">Acciones</div>
                   </div> */}
                   <div className="divide-y">
                        {filteredContentItems.map((item) => (
                            <ContentListItem key={item.id} contentItem={{...item, statusLabel: getStatusLabel(item.status)}} />
                        ))}
                   </div>
                </div>
            )}
         </div>
      ) : (
         <div className="text-center py-10 text-muted-foreground">
             {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterDate
                ? "No se encontraron elementos que coincidan con sus filtros."
                : "Aún no hay contenido para mostrar." // Fallback if no ejemplo items
             }
         </div>
      )}
    </div>
  );
}
