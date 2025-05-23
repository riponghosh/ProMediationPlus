import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Assuming you will integrate the CSS or use Tailwind classes directly
// import './ForgotEmail.css'; // You might not need this if using Tailwind classes

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added Card components
import { toast } from "sonner"; // Using sonner for consistency
import { ArrowLeft } from "lucide-react"; // Added ArrowLeft icon

const ForgotEmail = () => {
    const [email, setEmail] = useState<string>(''); // Added type annotation
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // State for loading indicator

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { // Added type annotation
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email address.");
            return;
        }

        setIsSubmitting(true);

        // TODO: Implement actual email reset logic using Firebase Authentication
        // Example placeholder:
        console.log("Attempting to send password reset email to:", email);

        // Simulate an API call or Firebase function call
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success(`Password reset email sent to ${email} (simulated).`);
            // Optionally navigate to a confirmation page or back to login
            // navigate('/login');
        }, 2000); // Simulate a 2-second delay
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4"> {/* Using Tailwind classes */}
      {/* Assuming you have a global header component or will add it here */}
      {/* <h1 className="text-3xl font-bold mb-8">MEDIATOR PRO</h1> */}

      <Card className="w-full max-w-sm"> {/* Using Card component */}
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Email</CardTitle>
          <CardDescription>
            Enter the email you used to sign up and we will send you further instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4"> {/* Using space-y for spacing */}
            <div className="space-y-2"> {/* Using space-y for spacing */}
              <Label htmlFor="email">Email</Label> {/* Using Label component */}
              <Input
                type="email"
                id="email"
                placeholder="Enter your email" // Improved placeholder
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required // Added required attribute
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}> {/* Using Button component, full width */}
              {isSubmitting ? 'Sending...' : 'Submit'} {/* Loading text */}
            </Button>

            <div className="text-center mt-4"> {/* Centering the link */}
              <Link to="/login" className="text-sm text-primary hover:underline flex items-center justify-center"> {/* Styling the link */}
                <ArrowLeft className="mr-1 h-4 w-4" /> {/* Added icon */}
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotEmail;