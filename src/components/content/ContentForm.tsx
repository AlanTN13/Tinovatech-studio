'use client';

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
// Firebase imports removed. Data persistence would be handled by your own backend.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns'; // Import parse
import { es } from 'date-fns/locale'; // Import Spanish locale for date picker
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentItem } from '@/types/contentItem';
import { exampleContentItems } from '@/data/exampleContent';


// Define categories - could be fetched from Firestore in the future
// Store internal values in English, display translated labels
const categories = [
    { value: "branding", label: "Branding" },
    { value: "promociones", label: "Promociones" },
    { value: "tips", label: "Tips" },
    { value: "campañas", label: "Campañas" },
    { value: "otro", label: "Otro" },
];
const statuses = [
    { value: 'draft', label: 'Borrador' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'published', label: 'Publicado' },
] as const; // Use const assertion for stricter type checking
const statusValues = statuses.map(s => s.value) as [typeof statuses[0]['value'], ...Array<typeof statuses[number]['value']>];

// Translate error messages
const contentSchema = z.object({
  title: z.string().min(1, { message: "El título es obligatorio." }),
  description: z.string().optional(),
  fileUrl: z.string().url({ message: "Por favor, introduce una URL válida." }).min(1, { message: "La URL del archivo es obligatoria." }),
  category: z.string().min(1, { message: "La categoría es obligatoria." }),
  suggestedDate: z.date().optional(), // Keep as date for picker, handle conversion on submit/load
  status: z.enum(statusValues), // Derive enum from values
  comments: z.string().optional(),
  // createdAt will be handled server-side, not part of the form schema itself
});


type ContentFormValues = z.infer<typeof contentSchema>;

interface ContentFormProps {
  initialData?: ContentItem; // Make initialData optional
  isEditing?: boolean;
  duplicateData?: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>; // Data for duplication
}

// Helper to parse 'YYYY-MM-DD' string into a Date object using UTC
const parseDateStringUTC = (dateString: string | undefined | null): Date | undefined => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return undefined;
    }
    try {
        // Parse as YYYY-MM-DD and treat as UTC to avoid timezone shifts affecting the date
        const date = parse(dateString, 'yyyy-MM-dd', new Date());
         // Check if parsing was successful and resulted in a valid date
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch (e) {
       console.error("Error parsing date string:", e);
    }
    return undefined;
}


const ContentForm: FC<ContentFormProps> = ({ initialData, isEditing = false, duplicateData }) => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isLoadingDuplicate, setIsLoadingDuplicate] = useState(false);

  const defaultValues = initialData
      ? { // Editing existing item
          title: initialData.title || '',
          description: initialData.description || '',
          fileUrl: initialData.fileUrl || '',
          category: initialData.category || '',
          suggestedDate: parseDateStringUTC(initialData.suggestedDate),
          status: initialData.status || 'draft',
          comments: initialData.comments || '',
        }
      : duplicateData
      ? { // Duplicating item
            title: `${duplicateData.title} (Copia)` || '',
            description: duplicateData.description || '',
            fileUrl: duplicateData.fileUrl || '',
            category: duplicateData.category || '',
            suggestedDate: undefined, // Reset date for duplicate
            status: 'draft' as const, // Reset status to draft
            comments: duplicateData.comments || '',
        }
      : { // New item from scratch
          title: '',
          description: '',
          fileUrl: '',
          category: '',
          suggestedDate: undefined,
          status: 'draft' as const,
          comments: '',
        };


  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: defaultValues,
  });

  const watchedStatus = form.watch('status'); // Watch the status field

  // Effect to fetch and populate data if duplicating
  useEffect(() => {
    const duplicateId = searchParams?.get('duplicateId');
    if (duplicateId && !initialData && !isEditing) {
      setIsLoadingDuplicate(true);
      try {
        const found = exampleContentItems.find((item) => item.id === duplicateId);
        if (found) {
          form.reset({
            title: `${found.title} (Copia)`,
            description: found.description || '',
            fileUrl: found.fileUrl || '',
            category: found.category || '',
            suggestedDate: undefined, // Reset date
            status: 'draft', // Reset status
            comments: found.comments || '',
          });
        } else {
          toast({ title: 'Error', description: 'Contenido original para duplicar no encontrado.', variant: 'destructive' });
          router.replace('/dashboard/new');
        }
      } catch (error) {
        console.error('Error fetching duplicate data:', error);
        toast({ title: 'Error', description: 'No se pudo cargar el contenido para duplicar.', variant: 'destructive' });
      } finally {
        setIsLoadingDuplicate(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, initialData, isEditing, form.reset, router, toast]); // Dependencies

   // Effect to reset form when initialData changes (e.g., navigating between edit pages)
   useEffect(() => {
      // Only reset if not duplicating and initialData is provided for editing
      if (!searchParams?.get('duplicateId') && initialData) {
          form.reset({
              title: initialData.title || '',
              description: initialData.description || '',
              fileUrl: initialData.fileUrl || '',
              category: initialData.category || '',
              suggestedDate: parseDateStringUTC(initialData.suggestedDate),
              status: initialData.status || 'draft',
              comments: initialData.comments || '',
          });
      }
      // If initialData is null/undefined AND not duplicating, ensure form is empty (for new)
       else if (!searchParams?.get('duplicateId') && !initialData) {
            form.reset({
                title: '',
                description: '',
                fileUrl: '',
                category: '',
                suggestedDate: undefined,
                status: 'draft',
                comments: '',
            });
       }
    // Watch initialData and searchParams presence
    }, [initialData, searchParams, form.reset]);


  const onSubmit = async (data: ContentFormValues) => {
    setLoading(true);
    try {
       // Convert Date object back to 'YYYY-MM-DD' string for Firestore or null
       const suggestedDateString = data.suggestedDate
         ? format(data.suggestedDate, 'yyyy-MM-dd') // Format Date to string
         : null;

       // Base data structure, excluding timestamps initially
       const dataToSaveBase: Omit<ContentItem, 'id' | 'statusLabel' | 'createdAt' | 'updatedAt'> & { suggestedDate: string | null } = {
            title: data.title,
            description: data.description || null,
            fileUrl: data.fileUrl,
            category: data.category,
            suggestedDate: suggestedDateString,
            status: data.status,
            comments: data.comments || null,
       };


      if (isEditing && initialData?.id) {
        // Update existing item locally (no persistence)
        toast({
          title: "Contenido Actualizado",
          description: "El elemento de contenido ha sido actualizado exitosamente (modo demostración).",
        });
      } else {
        // Create new item locally
        toast({
          title: "Contenido Creado",
          description: "El nuevo elemento de contenido ha sido creado exitosamente (modo demostración).",
        });
      }
      router.push('/dashboard');
      // router.refresh(); // Let react-query handle data refresh via invalidation or refetch on window focus
    } catch (error) {
      console.error("Error guardando contenido:", error);
      toast({
        title: "Error",
        description: `Error al ${isEditing ? 'actualizar' : 'crear'} el contenido. Por favor, inténtalo de nuevo.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine if the form is for duplicating
  const isDuplicating = !!searchParams?.get('duplicateId') && !isEditing;
  const formTitle = isEditing ? 'Editar Elemento de Contenido' : isDuplicating ? 'Duplicar Elemento de Contenido' : 'Añadir Nuevo Elemento de Contenido';
  const submitButtonText = loading
    ? (isEditing ? 'Actualizando...' : 'Creando...')
    : (isEditing ? 'Actualizar Contenido' : 'Crear Contenido');

  if (isLoadingDuplicate) {
      return <div className="text-center p-10">Cargando datos para duplicar...</div>;
  }


  return (
     <Card className="max-w-2xl mx-auto">
       <CardHeader>
         <CardTitle>{formTitle}</CardTitle>
       </CardHeader>
       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)}>
           <CardContent className="space-y-6">
             <FormField
               control={form.control}
               name="title"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Título *</FormLabel>
                   <FormControl>
                     <Input placeholder="Introduce el título del contenido" {...field} disabled={loading} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="description"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Descripción / Copy</FormLabel>
                   <FormControl>
                     <Textarea placeholder="Introduce la descripción o copy del post" {...field} value={field.value ?? ''} disabled={loading} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="fileUrl"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>URL del Archivo (Google Drive) *</FormLabel>
                   <FormControl>
                     <Input placeholder="https://drive.google.com/..." {...field} type="url" disabled={loading}/>
                   </FormControl>
                   <FormDescription>
                     Enlace al archivo de imagen o video en Google Drive.
                   </FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría *</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                         <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                           {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
               control={form.control}
               name="suggestedDate"
               render={({ field }) => (
                 <FormItem className="flex flex-col">
                   <FormLabel>Fecha de Publicación Sugerida</FormLabel>
                   <Popover>
                     <PopoverTrigger asChild>
                       <FormControl>
                         <Button
                           variant={"outline"}
                           className={cn(
                             "w-[240px] pl-3 text-left font-normal",
                             !field.value && "text-muted-foreground"
                           )}
                          disabled={loading}
                         >
                           {field.value ? (
                             format(field.value, "PPP", { locale: es }) // Format Date for display
                           ) : (
                             <span>Elige una fecha</span>
                           )}
                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                         </Button>
                       </FormControl>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0" align="start">
                       <Calendar
                         locale={es} // Use Spanish locale in Calendar component
                         mode="single"
                         selected={field.value} // Pass Date object to Calendar
                         onSelect={field.onChange} // Field onChange expects Date | undefined
                         disabled={(date) => // Optional: disable past dates
                            loading
                         }
                         initialFocus
                       />
                     </PopoverContent>
                   </Popover>
                   <FormMessage />
                 </FormItem>
               )}
             />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                    <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((stat) => (
                        <SelectItem key={stat.value} value={stat.value}>
                           {stat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditionally render Comments field */}
            {(watchedStatus === 'approved' || watchedStatus === 'published') && (
                <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Comentarios Internos</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Añade notas o comentarios internos" {...field} value={field.value ?? ''} disabled={loading}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
           </CardContent>
           <CardFooter>
             <Button type="submit" disabled={loading}>
                {submitButtonText}
             </Button>
              <Button variant="outline" type="button" onClick={() => router.back()} className="ml-4" disabled={loading}>
                 Cancelar
             </Button>
           </CardFooter>
         </form>
       </Form>
     </Card>
  );
};

export default ContentForm;
