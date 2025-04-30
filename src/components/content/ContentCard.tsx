import type { FC } from 'react';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Tag, MessageSquare, ExternalLink, Edit, Copy, Lightbulb, Target, Palette, Shapes } from 'lucide-react'; // Added icons: Copy, Lightbulb, Target, Palette, Shapes
import { format, parseISO, isValid } from 'date-fns'; // Import parseISO and isValid
import { es } from 'date-fns/locale'; // Import Spanish locale
import type { ContentItem } from '@/types/contentItem';
import { cn } from '@/lib/utils'; // Import cn for conditional classes

interface ContentCardProps {
  contentItem: ContentItem & { statusLabel: string }; // Add statusLabel
}

// Updated function to return Tailwind background and text classes
const getStatusClasses = (status: ContentItem['status']): string => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700'; // Verde
    case 'approved':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'; // Azul
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'; // Gris claro
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'; // Default gris claro
  }
};

// Function to get category icon
const getCategoryIcon = (category: string | undefined): React.ReactElement | null => {
    if (!category) return null;
    switch (category.toLowerCase()) {
        case 'campañas':
            return <Target className="mr-1 h-4 w-4" aria-label="Categoría Campañas" />;
        case 'tips':
            return <Lightbulb className="mr-1 h-4 w-4" aria-label="Categoría Tips" />;
        case 'branding':
            return <Palette className="mr-1 h-4 w-4" aria-label="Categoría Branding" />;
        case 'promociones':
            return <MessageSquare className="mr-1 h-4 w-4" aria-label="Categoría Promociones" />; // Using MessageSquare for 'Promociones'
        case 'otro':
             return <Shapes className="mr-1 h-4 w-4" aria-label="Categoría Otro"/>; // Example for 'Otro'
        default:
            return <Tag className="mr-1 h-4 w-4" aria-label="Categoría" />; // Default icon
    }
};


const ContentCard: FC<ContentCardProps> = ({ contentItem }) => {
  const router = useRouter();
  // Parse the suggestedDate string into a Date object
  const suggestedDateObject = contentItem.suggestedDate ? parseISO(contentItem.suggestedDate) : null;
  const isValidDate = suggestedDateObject && isValid(suggestedDateObject);

  const handleDuplicate = () => {
      // Navigate to the new content page with a query parameter indicating the ID to duplicate
      router.push(`/dashboard/new?duplicateId=${contentItem.id}`);
  };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200 border"> {/* Added border */}
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
             <CardTitle className="text-lg font-semibold flex-1">{contentItem.title || "Sin Título"}</CardTitle> {/* Fallback for title */}
             {/* Apply dynamic classes to Badge */}
             <Badge variant="outline" className={cn("capitalize shrink-0 text-xs", getStatusClasses(contentItem.status))}>
                {contentItem.statusLabel} {/* Use translated status label */}
            </Badge>
        </div>

        {contentItem.category && (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            {getCategoryIcon(contentItem.category)} {/* Use category icon */}
             {/* Ensure category exists before capitalizing */}
             <span>{contentItem.category ? contentItem.category.charAt(0).toUpperCase() + contentItem.category.slice(1) : 'Sin Categoría'}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {contentItem.description && (
          <div className="flex items-start text-sm">
            <FileText className="mr-2 h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-muted-foreground line-clamp-3">{contentItem.description}</p>
          </div>
        )}
         <div className="flex items-center text-sm">
          <ExternalLink className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          {contentItem.fileUrl ? (
             <a
                href={contentItem.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
                title={contentItem.fileUrl} // Add title for full URL on hover
             >
                Enlace al archivo {/* Translate Link text */}
             </a>
          ) : (
             <span className="text-muted-foreground italic">No hay enlace</span>
          )}

        </div>
        {/* Check if the parsed date is valid before formatting */}
        {isValidDate && suggestedDateObject && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" /> {/* Use Calendar icon */}
            {/* Format date using Spanish locale */}
            <span>{format(suggestedDateObject, 'PPP', { locale: es })}</span>
          </div>
        )}
        {contentItem.comments && (
            <div className="flex items-start text-sm italic">
                <MessageSquare className="mr-2 h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground line-clamp-2">"{contentItem.comments}"</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Link href={`/dashboard/edit/${contentItem.id}`} passHref>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" /> Editar {/* Translate Button text */}
          </Button>
        </Link>
         <Button variant="ghost" size="sm" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" /> Duplicar
        </Button>
        {/* Add Delete button or other actions here later */}
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
