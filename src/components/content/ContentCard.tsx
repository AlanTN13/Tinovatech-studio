import type { FC } from 'react';
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Tag, MessageSquare, ExternalLink, Edit } from 'lucide-react';
import { format } from 'date-fns';
import type { ContentItem } from '@/types/contentItem';

interface ContentCardProps {
  contentItem: ContentItem;
}

const getStatusVariant = (status: ContentItem['status']): 'default' | 'secondary' | 'outline' | 'destructive' | null | undefined => {
  switch (status) {
    case 'published':
      return 'default'; // Use primary (teal) for published
    case 'approved':
      return 'secondary'; // Use secondary for approved
    case 'draft':
      return 'outline'; // Use outline for draft
    default:
      return 'outline';
  }
};

const ContentCard: FC<ContentCardProps> = ({ contentItem }) => {
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
             <CardTitle className="text-lg font-semibold flex-1">{contentItem.title}</CardTitle>
             <Badge variant={getStatusVariant(contentItem.status)} className="capitalize shrink-0">
                {contentItem.status}
            </Badge>
        </div>

        {contentItem.category && (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Tag className="mr-1 h-4 w-4" />
            <span>{contentItem.category}</span>
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
          <a
            href={contentItem.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate"
          >
            {contentItem.fileUrl}
          </a>
        </div>
        {contentItem.suggestedDate && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{format(new Date(contentItem.suggestedDate), 'PPP')}</span>
          </div>
        )}
        {contentItem.comments && (
            <div className="flex items-start text-sm italic">
                <MessageSquare className="mr-2 h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground line-clamp-2">"{contentItem.comments}"</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Link href={`/dashboard/edit/${contentItem.id}`} passHref>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
