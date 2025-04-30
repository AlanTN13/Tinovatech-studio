'use client';

import type { ReactNode } from 'react';
import React from 'react'; // Removed useEffect
// Removed useRouter import
// import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, LogOut, PlusCircle } from 'lucide-react'; // Removed Settings
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // user will now be the mock user from AuthContext
  // loading will be false
  const { user, signOut } = useAuth();
  // Removed router initialization
  // const router = useRouter();

  // Removed useEffect for auth check and redirection
  /*
  useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);
  */

  // Removed loading check as loading is always false with bypassed auth
  /*
  if (loading || !user) {
    // Show loading state or redirect happens
    // You can render a loading spinner here, e.g., <LoadingSpinner />
    return <div>Loading authentication state...</div>;
  }
  */

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect or handle UI changes after mock sign out if needed
      // For now, let's just log it, AuthContext might handle redirect or state change
       console.log("Cierre de sesión simulado exitoso");
       // If you want to redirect after mock sign out:
       // window.location.href = '/'; // Simple redirect, consider Next.js router if staying within app
    } catch (error) {
      console.error("Error en cierre de sesión simulado:", error);
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
                <SidebarMenuButton tooltip="Panel Principal">
                  <LayoutDashboard />
                  <span>Panel Principal</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
               <Link href="/dashboard/new" passHref>
                  <SidebarMenuButton tooltip="Nuevo Contenido">
                    <PlusCircle />
                    <span>Nuevo Contenido</span>
                  </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2 border-t">
            <Avatar className="h-8 w-8">
              {/* Display mock user info */}
              <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
              {/* Display mock user info */}
              <span className="font-medium">{user?.displayName ?? 'Ileana'}</span>
              <span className="text-muted-foreground truncate">{user?.email ?? 'email@example.com'}</span>
            </div>
            {/* Keep sign out button but it now calls the mock signOut */}
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleSignOut} aria-label="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:hidden">
            <SidebarTrigger className="md:hidden"/>
             <h1 className="font-semibold text-lg md:hidden">Content Canvas</h1>
              {/* Keep sign out button but it now calls the mock signOut */}
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Cerrar Sesión</span>
              </Button>
        </header>
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
