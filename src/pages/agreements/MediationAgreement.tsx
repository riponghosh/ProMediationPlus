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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlertCircle, FileSignature, CalendarDays, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/layout";

// Define schema for party information
const partySchema = z.object({
  fullName: z.string().min(2, { message: "Name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  agreed: z.boolean().refine(val => val === true, {
    message: "Agreement must be confirmed",
  }),
  signature: z.string().optional(),
  signatureDate: z.string().optional(),
});

// Define schema for mediator information
const mediatorSchema = z.object({
  name: z.string().min(2, { message: "Mediator name is required" }),
  qualifications: z.string().min(2, { message: "Qualifications are required" }),
  organization: z.string().min(2, { message: "Organization is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
  signature: z.string().optional(),
  signatureDate: z.string().optional(),
});

// Define schema for entire mediation agreement
const mediationAgreementSchema = z.object({
  // Case details
  caseReference: z.string().min(1, { message: "Case reference is required" }),
  mediationDate: z.string().min(1, { message: "Mediation date is required" }),
  disputeNature: z.string().min(5, { message: "Description of dispute is required" }),
  
  // Mediation terms
  voluntaryParticipation: z.boolean().default(true),
  confidentiality: z.boolean().default(true),
  legalAdvice: z.boolean().default(true),
  costsAgreement: z.string().min(1, { message: "Costs agreement is required" }),
  mediationFormat: z.enum(["inPerson", "online", "hybrid"]).default("inPerson"),
  
  // Parties information
  partyA: partySchema,
  partyB: partySchema,
  
  // Mediator information
  mediator: mediatorSchema,
  
  // Agreement terms
  agreementTerms: z.string().min(10, { message: "Agreement terms are required" }),
  
  // Agreement date
  agreementDate: z.string().min(1, { message: "Agreement date is required" }),
});

type MediationAgreementFormValues = z.infer<typeof mediationAgreementSchema>;

// Main component
export function MediationAgreementBuilder() {
  const isMobile = useIsMobile();
  const form = useForm<MediationAgreementFormValues>({
    resolver: zodResolver(mediationAgreementSchema),
    defaultValues: {
      mediationDate: new Date().toISOString().split('T')[0],
      agreementDate: new Date().toISOString().split('T')[0],
      voluntaryParticipation: true,
      confidentiality: true,
      legalAdvice: true,
      mediationFormat: "inPerson",
      costsAgreement: "Parties agree to share mediation costs equally"
    },
  });

  function onSubmit(data: MediationAgreementFormValues) {
    console.log("Mediation Agreement Submitted:", data);
    toast.success("Mediation Agreement created successfully");
  }

  return (
    <Layout>
      {/* Header with back button, title/description, and search */}
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/templates">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Mediation Agreement</h1>
              <p className="text-muted-foreground text-sm">
                Create a standard agreement for the mediation process
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4 md:p-6 border rounded-md shadow-sm bg-white">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-center">AGREEMENT TO MEDIATE</h2>
              <p className="text-sm text-center text-muted-foreground">
                This agreement is made between the parties and the mediator(s) named below.
              </p>
              <Separator className="my-4" />
            </div>

            {/* Case Information */}
            <div className="space-y-4 p-4 border rounded-md bg-slate-50">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Case Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="caseReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="CF-XXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mediationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mediation Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="disputeNature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nature of Dispute</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe the nature of the dispute" 
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mediation Terms */}
            <div className="space-y-4 p-4 border rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Mediation Terms</h2>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Important</AlertTitle>
                <AlertDescription className="text-blue-600">
                  These terms form the binding agreement under which the mediation will proceed.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="voluntaryParticipation"
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
                          Voluntary Participation
                        </FormLabel>
                        <FormDescription>
                          The parties acknowledge that they are participating in the mediation process voluntarily.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confidentiality"
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
                          Confidentiality
                        </FormLabel>
                        <FormDescription>
                          All discussions and documents prepared for the mediation are confidential and without prejudice.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalAdvice"
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
                          Legal Advice
                        </FormLabel>
                        <FormDescription>
                          The parties understand that the mediator cannot provide legal advice and that they are encouraged to seek independent legal advice before finalizing any agreement.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mediationFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mediation Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="inPerson">In Person</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costsAgreement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costs Agreement</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Specify how costs will be shared between parties" 
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Party A Information */}
            <div className="space-y-4 p-4 border rounded-md bg-slate-50">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Party A Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="partyA.fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partyA.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partyA.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="partyA.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Full Address" 
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4 border-t mt-4">
                <FormField
                  control={form.control}
                  name="partyA.agreed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the terms of the mediation
                        </FormLabel>
                        <FormDescription>
                          By checking this box, I acknowledge that I have read, understand, and agree to the terms outlined in this agreement.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="partyA.signature"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Signature</FormLabel>
                        <FormControl>
                          <div className="flex items-center border p-2 rounded-md bg-white min-h-[60px]">
                            <FileSignature className="h-5 w-5 text-muted-foreground mr-2" />
                            <Input 
                              placeholder="Type name as signature" 
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partyA.signatureDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <div className="flex items-center border p-2 rounded-md bg-white">
                            <CalendarDays className="h-5 w-5 text-muted-foreground mr-2" />
                            <Input 
                              type="date" 
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Party B Information */}
            <div className="space-y-4 p-4 border rounded-md bg-slate-50">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Party B Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="partyB.fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partyB.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partyB.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="partyB.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Full Address" 
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4 border-t mt-4">
                <FormField
                  control={form.control}
                  name="partyB.agreed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the terms of the mediation
                        </FormLabel>
                        <FormDescription>
                          By checking this box, I acknowledge that I have read, understand, and agree to the terms outlined in this agreement.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="partyB.signature"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Signature</FormLabel>
                        <FormControl>
                          <div className="flex items-center border p-2 rounded-md bg-white min-h-[60px]">
                            <FileSignature className="h-5 w-5 text-muted-foreground mr-2" />
                            <Input 
                              placeholder="Type name as signature" 
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partyB.signatureDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <div className="flex items-center border p-2 rounded-md bg-white">
                            <CalendarDays className="h-5 w-5 text-muted-foreground mr-2" />
                            <Input 
                              type="date" 
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Mediator Information */}
            <div className="space-y-4 p-4 border rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Mediator Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mediator.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mediator Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mediator.qualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualifications</FormLabel>
                      <FormControl>
                        <Input placeholder="Professional qualifications" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mediator.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mediator.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mediator.organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="Organization or Practice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="mediator.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Professional Address" 
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="mediator.signature"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Mediator Signature</FormLabel>
                      <FormControl>
                        <div className="flex items-center border p-2 rounded-md bg-white min-h-[60px]">
                          <FileSignature className="h-5 w-5 text-muted-foreground mr-2" />
                          <Input 
                            placeholder="Type name as signature" 
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mediator.signatureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className="flex items-center border p-2 rounded-md bg-white">
                          <CalendarDays className="h-5 w-5 text-muted-foreground mr-2" />
                          <Input 
                            type="date" 
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Agreement Terms */}
            <div className="space-y-4 p-4 border rounded-md bg-slate-50">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Agreement Terms</h2>
              <FormField
                control={form.control}
                name="agreementTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Terms and Agreements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional terms or specifics of the agreement"
                        className="resize-none min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Agreement Date */}
            <div className="space-y-4 p-4 border rounded-md">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Agreement Date</h2>
              <div className="w-full md:w-1/3">
                <FormField
                  control={form.control}
                  name="agreementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Agreement</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">Save Draft</Button>
              <Button type="submit">Generate Agreement</Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}