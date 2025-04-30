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
    const uniqueCategories = new Set(contentItems?.map(item => item.category) ?? []);
    return ['all', ...Array.from(uniqueCategories)];
  }, [contentItems]);

  const statuses = ['all', 'draft', 'approved', 'published'];

  if (isLoading) return <div>Loading content...</div>;
  if (error) return <div>Error loading content: {error.message}</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Content Dashboard</h1>
         <Link href="/dashboard/new" passHref>
             <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Content
             </Button>
         </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg border shadow-sm">
         <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search by title or description..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {filteredContentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContentItems.map((item) => (
            <ContentCard key={item.id} contentItem={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
            No content items found matching your criteria.
        </div>
      )}
    </div>
  );
}
