'use client';

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
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
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentItem } from '@/types/contentItem';


// Define categories - could be fetched from Firestore in the future
const categories = ["branding", "promociones", "tips", "campañas", "otro"];
const statuses = ['draft', 'approved', 'published'] as const;

const contentSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  fileUrl: z.string().url({ message: "Please enter a valid URL." }).min(1, { message: "File URL is required." }),
  category: z.string().min(1, { message: "Category is required." }),
  suggestedDate: z.date().optional(),
  status: z.enum(statuses),
  comments: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

interface ContentFormProps {
  initialData?: ContentItem; // Make initialData optional
  isEditing?: boolean;
}

const ContentForm: FC<ContentFormProps> = ({ initialData, isEditing = false }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      fileUrl: initialData?.fileUrl || '',
      category: initialData?.category || '',
      suggestedDate: initialData?.suggestedDate ? new Date(initialData.suggestedDate) : undefined,
      status: initialData?.status || 'draft',
      comments: initialData?.comments || '',
    },
  });

   // Effect to reset form when initialData changes (e.g., navigating between edit pages)
   useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || '',
        fileUrl: initialData.fileUrl,
        category: initialData.category,
        suggestedDate: initialData.suggestedDate ? new Date(initialData.suggestedDate) : undefined,
        status: initialData.status,
        comments: initialData.comments || '',
      });
    } else {
        form.reset({ // Reset to default empty values if no initial data (for new form)
            title: '',
            description: '',
            fileUrl: '',
            category: '',
            suggestedDate: undefined,
            status: 'draft',
            comments: '',
        });
    }
  }, [initialData, form]);

  const onSubmit = async (data: ContentFormValues) => {
    setLoading(true);
    try {
       const dataToSave = {
        ...data,
        suggestedDate: data.suggestedDate ? data.suggestedDate.toISOString().split('T')[0] : null, // Store as YYYY-MM-DD string or null
        updatedAt: serverTimestamp(),
      };

      if (isEditing && initialData?.id) {
        const docRef = doc(db, 'contentItems', initialData.id);
        await updateDoc(docRef, dataToSave);
        toast({
          title: "Content Updated",
          description: "Your content item has been successfully updated.",
        });
      } else {
         await addDoc(collection(db, 'contentItems'), {
            ...dataToSave,
            createdAt: serverTimestamp(),
         });
        toast({
          title: "Content Created",
          description: "Your new content item has been successfully created.",
        });
      }
      router.push('/dashboard'); // Redirect to dashboard after save/update
      router.refresh(); // Refresh server components
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} content. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
     <Card className="max-w-2xl mx-auto">
       <CardHeader>
         <CardTitle>{isEditing ? 'Edit Content Item' : 'Add New Content Item'}</CardTitle>
       </CardHeader>
       <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)}>
           <CardContent className="space-y-6">
             <FormField
               control={form.control}
               name="title"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Title *</FormLabel>
                   <FormControl>
                     <Input placeholder="Enter content title" {...field} disabled={loading} />
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
                   <FormLabel>Description / Copy</FormLabel>
                   <FormControl>
                     <Textarea placeholder="Enter post description or copy" {...field} disabled={loading} />
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
                   <FormLabel>File URL (Google Drive) *</FormLabel>
                   <FormControl>
                     <Input placeholder="https://drive.google.com/..." {...field} type="url" disabled={loading}/>
                   </FormControl>
                   <FormDescription>
                     Link to the image or video file on Google Drive.
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
                  <FormLabel>Category *</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                         <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                           {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                   <FormLabel>Suggested Publication Date</FormLabel>
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
                             format(field.value, "PPP")
                           ) : (
                             <span>Pick a date</span>
                           )}
                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                         </Button>
                       </FormControl>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0" align="start">
                       <Calendar
                         mode="single"
                         selected={field.value}
                         onSelect={field.onChange}
                         disabled={(date) => // Optional: disable past dates
                           // date < new Date() || date < new Date("1900-01-01")
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
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                    <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((stat) => (
                        <SelectItem key={stat} value={stat}>
                           {stat.charAt(0).toUpperCase() + stat.slice(1)}
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
               name="comments"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Internal Comments</FormLabel>
                   <FormControl>
                     <Textarea placeholder="Add any internal notes or comments" {...field} disabled={loading}/>
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
           </CardContent>
           <CardFooter>
             <Button type="submit" disabled={loading}>
               {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Content' : 'Create Content')}
             </Button>
              <Button variant="outline" type="button" onClick={() => router.back()} className="ml-4" disabled={loading}>
                 Cancel
             </Button>
           </CardFooter>
         </form>
       </Form>
     </Card>
  );
};

export default ContentForm;
