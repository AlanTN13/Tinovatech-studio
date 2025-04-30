import type { FC } from 'react';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Tag, Edit, Copy, Lightbulb, Target, Palette, Shapes } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ContentItem } from '@/types/contentItem';
import { cn } from '@/lib/utils';

interface ContentListItemProps {
  contentItem: ContentItem & { statusLabel: string };
}

// Consistent status styling function (can be shared)
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

// Consistent category icon function (can be shared)
const getCategoryIcon = (category: string | undefined): React.ReactElement => {
    if (!category) return <Tag className="h-4 w-4 text-muted-foreground" />;
    switch (category.toLowerCase()) {
        case 'campañas':
            return <Target className="h-4 w-4 text-muted-foreground" aria-label="Categoría Campañas" />;
        case 'tips':
            return <Lightbulb className="h-4 w-4 text-muted-foreground" aria-label="Categoría Tips" />;
        case 'branding':
            return <Palette className="h-4 w-4 text-muted-foreground" aria-label="Categoría Branding" />;
        case 'promociones':
            return <MessageSquare className="h-4 w-4 text-muted-foreground" aria-label="Categoría Promociones" />;
        case 'otro':
             return <Shapes className="h-4 w-4 text-muted-foreground" aria-label="Categoría Otro"/>;
        default:
            return <Tag className="h-4 w-4 text-muted-foreground" />;
    }
};


const ContentListItem: FC<ContentListItemProps> = ({ contentItem }) => {
  const router = useRouter();
  const suggestedDateObject = contentItem.suggestedDate ? parseISO(contentItem.suggestedDate) : null;
  const isValidDate = suggestedDateObject && isValid(suggestedDateObject);

  const handleDuplicate = () => {
    router.push(`/dashboard/new?duplicateId=${contentItem.id}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 hover:bg-muted/50 transition-colors">
        {/* Main Info Section (Title, Description, Category) */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
            <span className="font-medium truncate">{contentItem.title || 'Sin Título'}</span>
            {/* Optional: Show description in list view */}
            {/* <p className="text-sm text-muted-foreground truncate">{contentItem.description || 'Sin descripción'}</p> */}
             {contentItem.category && (
                 <div className="flex items-center text-xs text-muted-foreground">
                    {getCategoryIcon(contentItem.category)}
                    <span className='ml-1'>{contentItem.category.charAt(0).toUpperCase() + contentItem.category.slice(1)}</span>
                 </div>
            )}
        </div>

        {/* Date Section */}
        <div className="w-full sm:w-auto sm:min-w-[130px] flex items-center text-sm text-muted-foreground gap-2">
            <Calendar className="h-4 w-4 shrink-0"/>
            {isValidDate && suggestedDateObject
                ? <span>{format(suggestedDateObject, 'P', { locale: es })}</span> // Short date format
                : <span className="italic">--</span>
            }
        </div>

         {/* Status Badge */}
        <div className="w-full sm:w-auto sm:min-w-[100px]">
            <Badge variant="outline" className={cn("capitalize text-xs", getStatusClasses(contentItem.status))}>
                {contentItem.statusLabel}
            </Badge>
        </div>

        {/* Actions Section */}
        <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-auto">
             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDuplicate} aria-label="Duplicar">
                 <Copy className="h-4 w-4" />
             </Button>
             <Link href={`/dashboard/edit/${contentItem.id}`} passHref>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Editar">
                    <Edit className="h-4 w-4" />
                </Button>
             </Link>
             {/* Add Delete button later */}
        </div>
    </div>
  );
};

export default ContentListItem;
