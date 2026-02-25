import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { createUserWithEmailAndPassword, signInWithPopup, OAuthProvider, Auth } from "firebase/auth"; // Import Auth type
// Assuming your main project has a Firebase setup file at src/firebase.ts
// import { auth, googleProvider, microsoftProvider } from '../firebase'; // Adjust path if needed

// Mock Firebase auth and providers for now if you haven't integrated them yet
// const mockAuth = {} as Auth; // Replace with your actual Firebase auth instance
const mockGoogleProvider = {} as any; // Replace with your actual GoogleAuthProvider instance
const mockMicrosoftProvider = {} as any; // Replace with your actual OAuthProvider instance

// const auth = mockAuth; // Use your actual auth instance
const googleProvider = mockGoogleProvider; // Use your actual provider
const microsoftProvider = mockMicrosoftProvider; // Use your actual provider


// Assuming you will integrate the CSS or use Tailwind classes directly
// import "./Signup.css"; // You might not need this if using Tailwind classes

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner"; // Using sonner for consistency
import { ArrowRight} from "lucide-react"; // Added icons
import { useForm } from "react-hook-form"; // Added react-hook-form
import { zodResolver } from "@hookform/resolvers/zod"; // Added zod resolver
import { z } from "zod"; // Added zod
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { registerUser } from "@/api/authServices";

// Define a schema for form validation
const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const Signup = () => {
  const [error, setError] = useState<string | null>(null); // Added type annotation
  const [loading, setLoading] = useState<boolean>(false); // Added type annotation
  const navigate = useNavigate();

  // Use react-hook-form for form handling
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = async (values: FormValues) => { // Use values from react-hook-form
    setError(null);
    setLoading(true);

    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
        
      // console.log('Attempting to sign up user with email:', values); 
       // Ensure auth is initialized
      //  if (!auth || Object.keys(auth).length === 0) {
      //      throw new Error("Firebase Auth is not initialized.");
      //  }
      // const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password); // Use values.email and values.password
      // console.log('User signed up successfully');

      // Store user info if needed (consider using a context or state management instead of localStorage)
      // const user = userCredential.user;
      // localStorage.setItem('user', JSON.stringify({
      //   uid: user.uid,
      //   email: user.email,
      //   displayName: user.displayName,
      //   photoURL: user.photoURL,
      //   authProvider: 'email'
      // }));
      toast.success("Signed up successfully!"); 

      // Redirect to the main app or dashboard
      navigate('/');
    } catch (error: any) { // Added type annotation for error
      setError("Failed to sign up. " + (error.message || ""));
      console.error('Signup error:', error);
      toast.error("Sign up failed. Please try again."); // Using sonner toast
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
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription> {/* Added description */}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-destructive text-sm mb-4">{error}</div> // Styled error message
          )}
          <Form {...form}> {/* Wrap form with FormProvider */}
            <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4"> {/* Use form.handleSubmit */}

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel> {/* Using FormLabel */}
                    <FormControl>
                      <Input
                        placeholder="Full Name"
                        {...field} // Bind form field props
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage /> {/* Display validation errors */}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel> {/* Using FormLabel */}
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field} // Bind form field props
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage /> {/* Display validation errors */}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel> {/* Using FormLabel */}
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field} // Bind form field props
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage /> {/* Display validation errors */}
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}> {/* Using Button component, full width */}
                {loading ? 'Signing up...' : 'Sign Up'} {/* Loading text */}
              </Button>

              {/* Social Sign Up Buttons */}
              {/* <div className="space-y-2 mt-4"> 
                 <Button
                   type="button"
                   className="w-full flex items-center justify-center gap-2" 
                   variant="outline" 
                   disabled={loading}
                 >
                   <Google className="h-5 w-5" /> 
                   
                   Sign up with Google
                 </Button>
                 <Button
                   type="button"
                   onClick={handleMicrosoftSignUp}
                   className="w-full flex items-center justify-center gap-2" 
                   variant="outline" 
                   disabled={loading}
                 >
                   <Microsoft className="h-5 w-5" /> 
                   Added icon
                   Sign up with Microsoft
                 </Button>
              </div> */}
            </form>
          </Form>

          <div className="text-center mt-6"> {/* Centering login prompt */}
            <p className="text-sm text-muted-foreground">Already have an account?</p> {/* Styled text */}
            <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center mt-2"> {/* Styled link */}
              Login
              <ArrowRight className="ml-1 h-4 w-4" /> {/* Added icon */}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;