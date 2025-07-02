import React from "react";
import { addItem } from "@/services/localDbService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Layout } from "@/components/layout/layout";
import { useNavigate } from 'react-router-dom'; 

// Define the schema for the enquiry form
const enquiryFormSchema = z.object({
  enquiryDate: z.string().optional().default(new Date().toISOString().split('T')[0]), // Default to today
  clientFirstName: z.string().min(1, "Client first name is required"), // Changed to clientFirstName
  clientLastName: z.string().min(1, "Client last name is required"), // Added clientLastName
  clientPhone: z.string().optional(),
  clientEmail: z.string().email("Invalid email address").optional(),
  otherPartyName: z.string().optional(),
  issueDescription: z.string().min(5, "Please provide a brief description").optional(),
  referralSource: z.string().optional(),
  contactType: z.enum(["New Enquiry", "Client", "Solicitor", "General"]),
});

type EnquiryFormData = z.infer<typeof enquiryFormSchema>;

export function ClientEnquiryForm() {
  const navigate = useNavigate(); 
  const form = useForm<EnquiryFormData>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      enquiryDate: new Date().toISOString().split('T')[0],
      clientFirstName: "", // Changed to clientFirstName
      clientLastName: "", // Added clientLastName
      clientPhone: "",
      clientEmail: "",
      otherPartyName: "",
      issueDescription: "",
      referralSource: "",
      contactType: "New Enquiry",
    },
  });

  async function onSubmit(data: EnquiryFormData) {
    console.log("Client Enquiry Form Submitted:", data);
    try {
      await addItem('contacts', {
        id: crypto.randomUUID(),
        firstName: data.clientFirstName, // Changed to firstName
        lastName: data.clientLastName, // Added lastName
        phone: data.clientPhone,
        email: data.clientEmail,
        type: data.contactType,
        createdAt: new Date().toISOString(), // Added createdAt
        updatedAt: new Date().toISOString(), // Added updatedAt
      });
      toast.success("Client enquiry saved and contact created.");
      // Optionally reset the form after submission
      // form.reset();
    } catch (error) {
      console.error("Failed to save contact:", error);
      toast.error("Failed to save contact.");
    }
  }

  return (
    <Layout>
      <div className="flex items-center mb-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Client Enquiry</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Use this form to record details of new client enquiries.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-md max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">Client Enquiry Form</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormField
            control={form.control}
            name="enquiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Enquiry</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="clientFirstName" // Changed to clientFirstName
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client First Name *</FormLabel> 
                <FormControl>
                  <Input placeholder="Enter client's first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientLastName" // Added clientLastName field
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client's last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter client's phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter client's email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otherPartyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Party Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter other party's name (if known)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="referralSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Source</FormLabel>
                <FormControl>
                  <Input placeholder="How did the client hear about us?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="New Enquiry">New Enquiry</option>
                    <option value="Client">Client</option>
                    <option value="Solicitor">Solicitor</option>
                    <option value="General">General</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="issueDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brief Description of Issue</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Summarize the reason for the enquiry..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto">Save Enquiry</Button>
      </form>
    </Form>
    </Layout>
  );
}

export default ClientEnquiryForm;