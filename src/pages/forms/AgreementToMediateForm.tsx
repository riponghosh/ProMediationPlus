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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileSignature, CalendarDays } from "lucide-react"; // Icons

// Define the schema for one party's agreement
const partyAgreementSchema = z.object({
  agreed: z.boolean().default(false).refine(val => val === true, {
    message: "Agreement must be confirmed.",
  }),
  signaturePlaceholder: z.string().optional(), // Placeholder for digital signature or typed name
  agreementDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

// Define the schema for the combined agreement form
const agreementFormSchema = z.object({
  agreementVersion: z.string().optional().default("v1.0 - " + new Date().getFullYear()), // Example versioning
  partyA: partyAgreementSchema,
  partyB: partyAgreementSchema,
  additionalNotes: z.string().optional(),
});

type AgreementFormData = z.infer<typeof agreementFormSchema>;

// TODO: Add props to receive initial party names if available
export function AgreementToMediateForm() {
  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: {
      agreementVersion: "v1.0 - " + new Date().getFullYear(),
      partyA: {
        agreed: false,
        signaturePlaceholder: "",
        agreementDate: new Date().toISOString().split('T')[0],
      },
      partyB: {
        agreed: false,
        signaturePlaceholder: "",
        agreementDate: new Date().toISOString().split('T')[0],
      },
      additionalNotes: "",
    },
  });

  function onSubmit(data: AgreementFormData) {
    console.log("Agreement to Mediate Form Submitted:", data);
    // TODO: Implement saving logic (e.g., link to matter, store status)
    toast.success("Agreement to Mediate saved successfully (simulated).");
  }

  // Helper to render party agreement section
  const renderPartySection = (party: 'partyA' | 'partyB', partyLabel: string) => (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-medium">{partyLabel} Agreement</h3>
      <FormField
        control={form.control}
        name={`${party}.agreed`}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Confirm Agreement
              </FormLabel>
              <FormDescription>
                {partyLabel} confirms they have read and agree to the terms of mediation.
              </FormDescription>
               <FormMessage /> {/* Display validation message here */}
            </div>
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name={`${party}.signaturePlaceholder`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <FileSignature className="mr-2 h-4 w-4" /> Signature (Type Name)
            </FormLabel>
            <FormControl>
              <Input placeholder={`Type full name of ${partyLabel}`} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name={`${party}.agreementDate`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
               <CalendarDays className="mr-2 h-4 w-4" /> Date Agreed
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-md">
        <div className="flex justify-between items-center">
           <h2 className="text-xl font-semibold">Agreement to Mediate</h2>
           <FormField
                control={form.control}
                name="agreementVersion"
                render={({ field }) => (
                <FormItem className="w-1/3">
                    <FormLabel className="text-xs">Version</FormLabel>
                    <FormControl>
                    <Input {...field} readOnly className="text-xs h-8"/>
                    </FormControl>
                </FormItem>
                )}
            />
        </div>


        {renderPartySection('partyA', 'Party A')}
        {renderPartySection('partyB', 'Party B')}

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes or Stipulations</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Record any specific agreements or notes related to the mediation process..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Agreement</Button>
      </form>
    </Form>
  );
}