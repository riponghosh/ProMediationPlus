import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail, Auth } from 'firebase/auth'; // Import Auth type and sendPasswordResetEmail
// Assuming your main project has a Firebase setup file at src/firebase.ts
// import { app } from '../firebase'; // Assuming app is your Firebase app instance

// Mock Firebase auth for now if you haven't integrated it yet
const mockAuth = {} as Auth; // Replace with your actual Firebase auth instance
const auth = mockAuth; // Use your actual auth instance


// Assuming you will integrate the CSS or use Tailwind classes directly
// import './PasswordReset.css'; // You might not need this if using Tailwind classes

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner"; // Using sonner for consistency
import { ArrowLeft } from "lucide-react"; // Added ArrowLeft icon
import { useForm } from "react-hook-form"; // Added react-hook-form
import { zodResolver } from "@hookform/resolvers/zod"; // Added zod resolver
import { z } from "zod"; // Added zod

// Define a schema for form validation
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

const PasswordReset = () => {
  const [loading, setLoading] = useState<boolean>(false); // Added type annotation

  // Use react-hook-form for form handling
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: FormValues) => { // Use values from react-hook-form
    setLoading(true);

    try {
       // Ensure auth is initialized
       if (!auth || Object.keys(auth).length === 0) {
           throw new Error("Firebase Auth is not initialized.");
       }
      await sendPasswordResetEmail(auth, values.email); // Use values.email
      console.log("Password reset email sent successfully");
      toast.success(`Password reset email sent to ${values.email}.`); // Using sonner toast
      // Optionally navigate to a confirmation page or back to login
      // navigate('/login');
    } catch (error: any) { // Added type annotation for error
      console.error("Password reset error:", error);
      toast.error(`Failed to send password reset email. ${error.message || ""}`); // Using sonner toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4"> {/* Using Tailwind classes */}
      {/* Assuming you have a global header component or will add it here */}
      {/* <h1 className="text-3xl font-bold mb-8">MEDIATOR PRO</h1> */}

      <Card className="w-full max-w-sm"> {/* Using Card component */}
        <CardHeader className="text-center"> {/* Centering header content */}
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}> {/* Wrap form with FormProvider */}
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4"> {/* Use form.handleSubmit */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel> {/* Using FormLabel */}
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email" // Improved placeholder
                        {...field} // Bind form field props
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage /> {/* Display validation errors */}
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}> {/* Using Button component, full width */}
                {loading ? 'Sending...' : 'Reset Password'} {/* Loading text */}
              </Button>

              <div className="text-center mt-4"> {/* Centering the link */}
                <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center"> {/* Styling the link */}
                  <ArrowLeft className="mr-1 h-4 w-4" /> {/* Added icon */}
                  Back to Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;