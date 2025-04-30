'use client';

import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage(): ReactElement {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
       const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
       // Check if the logged-in user's email is the allowed one
       if (userCredential.user.email !== 'ileana@example.com') { // Replace with actual allowed email
         // Sign out the user immediately if the email is not allowed
         await auth.signOut();
         toast({
           title: "Access Denied",
           description: "You do not have permission to access this application.",
           variant: "destructive",
         });
       } else {
         // Successful login for the allowed user - AuthProvider will handle redirect
         toast({
           title: "Login Successful",
           description: "Welcome back!",
         });
         // No explicit redirect here, AuthProvider handles it based on auth state change
       }
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      }
       toast({
         title: "Login Error",
         description: errorMessage,
         variant: "destructive",
       });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Content Canvas Login</CardTitle>
          <CardDescription>Enter your email below to login</CardDescription>
        </CardHeader>
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
               <FormField
                 control={form.control}
                 name="email"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Email</FormLabel>
                     <FormControl>
                       <Input placeholder="ileana@example.com" {...field} type="email" disabled={loading}/>
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="password"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Password</FormLabel>
                     <FormControl>
                       <Input type="password" {...field} disabled={loading} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </CardFooter>
           </form>
         </Form>
      </Card>
    </div>
  );
}
