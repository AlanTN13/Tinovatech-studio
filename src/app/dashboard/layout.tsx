'use client';

import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, LogOut, PlusCircle, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Show loading state or redirect happens
    // You can render a loading spinner here, e.g., <LoadingSpinner />
    return <div>Loading authentication state...</div>;
  }


  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/'); // Redirect to home/login page after sign out
    } catch (error) {
      console.error("Sign out failed:", error);
      // Handle sign out error (e.g., show a toast notification)
    }
  };


  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.79-1.272 5.244 0a.75.75 0 01-.988 1.13zM10.764 15a.75.75 0 01.75-.75h.01a.75.75 0 110 1.5H11.5a.75.75 0 01-.736-.75zm4.5 0a.75.75 0 01.75-.75h.01a.75.75 0 110 1.5H16a.75.75 0 01-.736-.75z" clipRule="evenodd" />
             </svg>
            <h1 className="text-lg font-semibold">Content Canvas</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
               <Link href="/dashboard" passHref>
                <SidebarMenuButton>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
               <Link href="/dashboard/new" passHref>
                  <SidebarMenuButton>
                    <PlusCircle />
                    <span>New Content</span>
                  </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             {/* Add more navigation items here if needed */}
              {/* <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2 border-t">
            <Avatar className="h-8 w-8">
              {/* Add user avatar image if available */}
              {/* <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> */}
              <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
              <span className="font-medium">Ileana</span>
              <span className="text-muted-foreground truncate">{user.email}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:hidden">
            <SidebarTrigger className="md:hidden"/>
             <h1 className="font-semibold text-lg md:hidden">Content Canvas</h1>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
              </Button>
        </header>
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
