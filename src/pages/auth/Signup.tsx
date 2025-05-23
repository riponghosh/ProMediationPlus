import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, OAuthProvider, Auth } from "firebase/auth"; // Import Auth type
// Assuming your main project has a Firebase setup file at src/firebase.ts
// import { auth, googleProvider, microsoftProvider } from '../firebase'; // Adjust path if needed

// Mock Firebase auth and providers for now if you haven't integrated them yet
const mockAuth = {} as Auth; // Replace with your actual Firebase auth instance
const mockGoogleProvider = {} as any; // Replace with your actual GoogleAuthProvider instance
const mockMicrosoftProvider = {} as any; // Replace with your actual OAuthProvider instance

const auth = mockAuth; // Use your actual auth instance
const googleProvider = mockGoogleProvider; // Use your actual provider
const microsoftProvider = mockMicrosoftProvider; // Use your actual provider


// Assuming you will integrate the CSS or use Tailwind classes directly
// import "./Signup.css"; // You might not need this if using Tailwind classes

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner"; // Using sonner for consistency
import { ArrowRight, Google, Microsoft } from "lucide-react"; // Added icons
import { useForm } from "react-hook-form"; // Added react-hook-form
import { zodResolver } from "@hookform/resolvers/zod"; // Added zod resolver
import { z } from "zod"; // Added zod

// Define a schema for form validation
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
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
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignup = async (values: FormValues) => { // Use values from react-hook-form
    setError(null);
    setLoading(true);

    try {
       // Ensure auth is initialized
       if (!auth || Object.keys(auth).length === 0) {
           throw new Error("Firebase Auth is not initialized.");
       }
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password); // Use values.email and values.password
      console.log('User signed up successfully');

      // Store user info if needed (consider using a context or state management instead of localStorage)
      const user = userCredential.user;
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        authProvider: 'email'
      }));
      toast.success("Signed up successfully!"); // Using sonner toast

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

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);

    try {
       // Ensure auth and provider are initialized
       if (!auth || Object.keys(auth).length === 0 || !googleProvider || Object.keys(googleProvider).length === 0) {
           throw new Error("Firebase Auth or Google Provider is not initialized.");
       }
      const result = await signInWithPopup(auth, googleProvider);
      console.log("User signed up with Google successfully");

      const user = result.user;
      // Store user info if needed (consider using a context or state management instead of localStorage)
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        authProvider: 'google'
      }));
      toast.success("Signed up with Google!"); // Using sonner toast

      // Redirect to main page
      navigate('/');
    } catch (error: any) { // Added type annotation for error
      console.error("Google Sign-Up Error:", error);
      setError("Failed to sign up with Google. " + (error.message || ""));
      toast.error("Google Sign-Up failed."); // Using sonner toast
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftSignUp = async () => {
    setError(null);
    setLoading(true);

    try {
       // Ensure auth and provider are initialized
       if (!auth || Object.keys(auth).length === 0 || !microsoftProvider || Object.keys(microsoftProvider).length === 0) {
           throw new Error("Firebase Auth or Microsoft Provider is not initialized.");
       }
      const result = await signInWithPopup(auth, microsoftProvider);
      console.log("User signed up with Microsoft successfully");

      // Get Microsoft access token for later use with MS Graph API
      const credential = OAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken; // Use optional chaining

      if (accessToken) {
         // Store the token for later use with MS Graph API for emails
         localStorage.setItem('msAccessToken', accessToken);
      }

      const user = result.user;
      // Store user info if needed (consider using a context or state management instead of localStorage)
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        authProvider: 'microsoft'
      }));
      toast.success("Signed up with Microsoft!"); // Using sonner toast

      // Redirect to main page
      navigate('/');
    } catch (error: any) { // Added type annotation for error
      console.error("Microsoft Sign-Up Error:", error);
      setError("Failed to sign up with Microsoft. " + (error.message || ""));
      toast.error("Microsoft Sign-Up failed."); // Using sonner toast
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
              <div className="space-y-2 mt-4"> {/* Added spacing */}
                 <Button
                   type="button"
                   onClick={handleGoogleSignUp}
                   className="w-full flex items-center justify-center gap-2" // Styled button
                   variant="outline" // Use outline variant
                   disabled={loading}
                 >
                   <Google className="h-5 w-5" /> {/* Added icon */}
                   Sign up with Google
                 </Button>
                 <Button
                   type="button"
                   onClick={handleMicrosoftSignUp}
                   className="w-full flex items-center justify-center gap-2" // Styled button
                   variant="outline" // Use outline variant
                   disabled={loading}
                 >
                   <Microsoft className="h-5 w-5" /> {/* Added icon */}
                   Sign up with Microsoft
                 </Button>
              </div>
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