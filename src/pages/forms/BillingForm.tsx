import React from "react";
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
import { Share2 } from "lucide-react"; // Import Share icon

// Define the schema for one party's billing details
const partyBillingSchema = z.object({
  name: z.string().optional(), // Pre-fill ideally
  email: z.string().email("Invalid email address").optional(), // Pre-fill ideally
  billingAddress: z.string().optional(),
  hourlyRate: z.number().positive("Rate must be positive").optional(),
  hoursBilled: z.number().min(0, "Hours cannot be negative").optional(),
  totalAmount: z.number().optional(), // Calculated potentially
  paymentStatus: z.enum(["Unpaid", "Paid", "Partially Paid"]).optional().default("Unpaid"),
  notes: z.string().optional(),
});

// Define the schema for the combined billing form
const billingFormSchema = z.object({
  invoiceNumber: z.string().optional().default(`INV-${Date.now().toString().slice(-6)}`), // Auto-generate simple invoice number
  invoiceDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  partyA: partyBillingSchema,
  partyB: partyBillingSchema,
  sharedNotes: z.string().optional(),
});

type BillingFormData = z.infer<typeof billingFormSchema>;

// TODO: Add props to receive initial party names/emails if available from matter context
export function BillingForm() {
  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      partyA: {
        name: "", // Populate from props if available
        email: "", // Populate from props if available
        billingAddress: "",
        hourlyRate: undefined, // Use undefined for optional numbers
        hoursBilled: undefined,
        totalAmount: undefined,
        paymentStatus: "Unpaid",
        notes: "",
      },
      partyB: {
        name: "", // Populate from props if available
        email: "", // Populate from props if available
        billingAddress: "",
        hourlyRate: undefined,
        hoursBilled: undefined,
        totalAmount: undefined,
        paymentStatus: "Unpaid",
        notes: "",
      },
      sharedNotes: "",
    },
  });

  // Basic calculation example (can be expanded)
  const calculateTotal = (party: 'partyA' | 'partyB') => {
    const rate = form.watch(`${party}.hourlyRate`);
    const hours = form.watch(`${party}.hoursBilled`);
    if (rate && hours) {
      form.setValue(`${party}.totalAmount`, rate * hours);
    } else {
       form.setValue(`${party}.totalAmount`, undefined); // Clear if rate or hours missing
    }
  };

  // Trigger calculation when rate or hours change
  React.useEffect(() => {
    calculateTotal('partyA');
  }, [form.watch('partyA.hourlyRate'), form.watch('partyA.hoursBilled')]);

  React.useEffect(() => {
    calculateTotal('partyB');
  }, [form.watch('partyB.hourlyRate'), form.watch('partyB.hoursBilled')]);


  function onSubmit(data: BillingFormData) {
    console.log("Billing Form Submitted:", data);
    // TODO: Implement saving logic
    toast.success("Billing form saved successfully (simulated).");
  }

  const handleShare = (party: 'partyA' | 'partyB') => {
    const partyData = form.getValues(party);
    console.log(`Sharing billing details for ${partyData.name || party}:`, partyData);
    // TODO: Implement actual sharing mechanism (e.g., generate PDF, send email)
    toast.info(`Sharing form for ${partyData.name || party} (simulated).`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-md">
        <h2 className="text-xl font-semibold mb-4">Billing Form</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoiceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Party A Billing Details */}
        <div className="space-y-4 p-4 border rounded-md relative">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-lg font-medium">Party A Billing</h3>
             <Button type="button" variant="outline" size="sm" onClick={() => handleShare('partyA')}>
               <Share2 className="mr-2 h-4 w-4" /> Share with Party A
             </Button>
           </div>
           {/* Add fields for Party A using partyBillingSchema */}
           <FormField control={form.control} name="partyA.name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Party A Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
           <FormField control={form.control} name="partyA.email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Party A Email" {...field} /></FormControl><FormMessage /></FormItem>)} />
           <FormField control={form.control} name="partyA.billingAddress" render={({ field }) => (<FormItem><FormLabel>Billing Address</FormLabel><FormControl><Textarea placeholder="Party A Billing Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="partyA.hourlyRate" render={({ field }) => (<FormItem><FormLabel>Hourly Rate (€)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 150.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="partyA.hoursBilled" render={({ field }) => (<FormItem><FormLabel>Hours Billed</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 5.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="partyA.totalAmount" render={({ field }) => (<FormItem><FormLabel>Total (€)</FormLabel><FormControl><Input type="number" {...field} readOnly placeholder="Calculated" /></FormControl><FormMessage /></FormItem>)} />
           </div>
           {/* Add Payment Status Dropdown if needed */}
           <FormField control={form.control} name="partyA.notes" render={({ field }) => (<FormItem><FormLabel>Notes (Party A)</FormLabel><FormControl><Textarea placeholder="Specific notes for Party A's bill..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        {/* Party B Billing Details */}
         <div className="space-y-4 p-4 border rounded-md relative">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-lg font-medium">Party B Billing</h3>
             <Button type="button" variant="outline" size="sm" onClick={() => handleShare('partyB')}>
               <Share2 className="mr-2 h-4 w-4" /> Share with Party B
             </Button>
           </div>
           {/* Add fields for Party B using partyBillingSchema */}
           <FormField control={form.control} name="partyB.name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Party B Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
           <FormField control={form.control} name="partyB.email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Party B Email" {...field} /></FormControl><FormMessage /></FormItem>)} />
           <FormField control={form.control} name="partyB.billingAddress" render={({ field }) => (<FormItem><FormLabel>Billing Address</FormLabel><FormControl><Textarea placeholder="Party B Billing Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="partyB.hourlyRate" render={({ field }) => (<FormItem><FormLabel>Hourly Rate (€)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 150.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="partyB.hoursBilled" render={({ field }) => (<FormItem><FormLabel>Hours Billed</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 5.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="partyB.totalAmount" render={({ field }) => (<FormItem><FormLabel>Total (€)</FormLabel><FormControl><Input type="number" {...field} readOnly placeholder="Calculated" /></FormControl><FormMessage /></FormItem>)} />
           </div>
           {/* Add Payment Status Dropdown if needed */}
           <FormField control={form.control} name="partyB.notes" render={({ field }) => (<FormItem><FormLabel>Notes (Party B)</FormLabel><FormControl><Textarea placeholder="Specific notes for Party B's bill..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        {/* Shared Notes */}
        <FormField
          control={form.control}
          name="sharedNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shared Billing Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="General notes applicable to the overall billing for this matter..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Billing Information</Button>
      </form>
    </Form>
  );
}