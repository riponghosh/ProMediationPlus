import React, { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Info, FileText, ChevronLeft, CalendarDays, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { getAllCaseFileNumbers } from "@/services/localDbService";

// Import PDF generation libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  linkedCaseFileNumber: z.string().optional(), // Added for case file number
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

  // Signatures
  partyASignatureName: z.string().optional(),
  partyASignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  partyBSignatureName: z.string().optional(),
  partyBSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  mediatorSignatureName: z.string().optional(),
  mediatorSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type MediationAgreementFormValues = z.infer<typeof mediationAgreementSchema>;

// --- Helper Component for Sections ---
interface SectionProps {
    title: string;
    children: React.ReactNode;
    description?: string;
}

const AgreementSection: React.FC<SectionProps> = ({ title, children, description }) => (
    <div className="space-y-4 p-4 md:p-6 border rounded-lg bg-slate-50/50">
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

// --- Helper Component for Text Fields (Textarea) ---
interface AgreementTextFieldProps {
    control: any;
    name: keyof MediationAgreementFormValues;
    label: string;
    description?: string;
    placeholder?: string;
    rows?: number;
}

const AgreementTextField: React.FC<AgreementTextFieldProps> = ({ control, name, label, description, placeholder, rows = 3 }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel className="font-medium">{label}</FormLabel>
                {description && <FormDescription>{description}</FormDescription>}
                <FormControl>
                    <Textarea
                        placeholder={placeholder || `Details for ${label.toLowerCase()}...`}
                        rows={rows}
                        {...field}
                        value={field.value || ""} // Ensure controlled component
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);

// --- Helper Component for Input Fields ---
interface AgreementInputFieldProps {
    control: any;
    name: keyof MediationAgreementFormValues;
    label: string;
    description?: string;
    placeholder?: string;
    type?: string;
}

const AgreementInputField: React.FC<AgreementInputFieldProps> = ({ control, name, label, description, placeholder, type = "text" }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel className="font-medium">{label}</FormLabel>
                {description && <FormDescription>{description}</FormDescription>}
                <FormControl>
                    <Input
                        type={type}
                        placeholder={placeholder}
                        {...field}
                        value={field.value || ""} // Ensure controlled component
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);

// Main component
export function MediationAgreementBuilder() {
  const isMobile = useIsMobile();
  const [caseFileNumbers, setCaseFileNumbers] = useState<string[]>([]);
  const form = useForm<MediationAgreementFormValues>({
    resolver: zodResolver(mediationAgreementSchema),
    defaultValues: {
      linkedCaseFileNumber: undefined,
      mediationDate: new Date().toISOString().split('T')[0],
      agreementDate: new Date().toISOString().split('T')[0],
      voluntaryParticipation: true,
      confidentiality: true,
      legalAdvice: true,
      mediationFormat: "inPerson",
      costsAgreement: "Parties agree to share mediation costs equally",
      partyA: {
        fullName: "",
        address: "",
        phone: "",
        email: "",
        agreed: false,
      },
      partyB: {
        fullName: "",
        address: "",
        phone: "",
        email: "",
        agreed: false,
      },
      mediator: {
        name: "",
        qualifications: "",
        organization: "",
        address: "",
        email: "",
        phone: "",
      },
      agreementTerms: "The parties agree to engage in mediation voluntarily and in good faith to resolve their dispute. All discussions and documents shared during mediation will remain confidential, except as required by law. The mediator will facilitate communication but will not impose a solution. Parties are encouraged to seek independent legal advice. Costs will be shared as agreed.",
      partyASignatureName: "",
      partyASignatureDate: new Date().toISOString().split('T')[0],
      partyBSignatureName: "",
      partyBSignatureDate: new Date().toISOString().split('T')[0],
      mediatorSignatureName: "",
      mediatorSignatureDate: new Date().toISOString().split('T')[0],
    },
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  const watchedPartyAName = form.watch("partyA.fullName");
  const watchedPartyBName = form.watch("partyB.fullName");
  const watchedMediatorName = form.watch("mediator.name");

  useEffect(() => {
    const fetchCaseFiles = async () => {
        try {
            const numbers = await getAllCaseFileNumbers();
            setCaseFileNumbers(numbers);
        } catch (error) {
            console.error("Failed to fetch case file numbers:", error);
            toast.error("Failed to load case file numbers for selection.");
        }
    };
    fetchCaseFiles();
}, []);

  React.useEffect(() => {
    if (watchedPartyAName && !form.getValues("partyASignatureName")) {
        form.setValue("partyASignatureName", watchedPartyAName, { shouldValidate: false });
    }
}, [watchedPartyAName, form]);

React.useEffect(() => {
    if (watchedPartyBName && !form.getValues("partyBSignatureName")) {
        form.setValue("partyBSignatureName", watchedPartyBName, { shouldValidate: false });
    }
}, [watchedPartyBName, form]);

React.useEffect(() => {
    if (watchedMediatorName && !form.getValues("mediatorSignatureName")) {
        form.setValue("mediatorSignatureName", watchedMediatorName, { shouldValidate: false });
    }
}, [watchedMediatorName, form]);

  function onSubmit(data: MediationAgreementFormValues) {
    console.log("Mediation Agreement Data:", JSON.stringify(data, null, 2));
    toast.success("Mediation Agreement data saved (simulated).");
  }

  const handleDownloadPdf = async () => {
    const formElement = formRef.current;
    if (!formElement) {
        toast.error("Form element not found. Cannot generate PDF.");
        return;
    }

    toast.info("Generating PDF, please wait...", { duration: 5000 });

    const downloadButton = document.getElementById("download-pdf-button");
    const saveButton = document.getElementById("save-agreement-button");
    
    const originalDownloadDisplay = downloadButton ? downloadButton.style.display : '';
    const originalSaveDisplay = saveButton ? saveButton.style.display : '';

    if (downloadButton) downloadButton.style.display = 'none';
    if (saveButton) saveButton.style.display = 'none';

    try {
        const canvas = await html2canvas(formElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: formElement.scrollWidth,
            windowHeight: formElement.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const pageMargin = 10;

        const availableWidth = pdfWidth - (2 * pageMargin);
        const imgRenderWidth = availableWidth;
        const imgRenderHeight = (imgProps.height * imgRenderWidth) / imgProps.width;

        let heightLeft = imgRenderHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', pageMargin, pageMargin + position, imgRenderWidth, imgRenderHeight);
        heightLeft -= (pdfHeight - (2 * pageMargin));

        while (heightLeft > 0) {
            position -= (pdfHeight - (2 * pageMargin));
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', pageMargin, pageMargin + position, imgRenderWidth, imgRenderHeight);
            heightLeft -= (pdfHeight - (2 * pageMargin));
        }

        pdf.save('MediationAgreement.pdf');
        toast.success("PDF downloaded successfully!");

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF. See console for details.");
    } finally {
        if (downloadButton) downloadButton.style.display = originalDownloadDisplay;
        if (saveButton) saveButton.style.display = originalSaveDisplay;
    }
};

  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} pb-10`}>
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
          <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef} className="space-y-8 p-4 md:p-6 border rounded-md shadow-sm bg-white">
            <FormField
                control={form.control}
                name="linkedCaseFileNumber"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Link to Case (Optional)</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a case to link" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="__NONE__">None</SelectItem>
                                {caseFileNumbers.map((cfn) => (
                                    <SelectItem key={cfn} value={cfn}>
                                        {cfn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-center">AGREEMENT TO MEDIATE</h2>
              <p className="text-sm text-center text-muted-foreground">
                This agreement is made between the parties and the mediator(s) named below.
              </p>
              <Separator className="my-4" />
            </div>

            {/* Case Information */}
            <AgreementSection title="Case Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AgreementInputField
                  control={form.control}
                  name="caseReference"
                  label="Case Reference"
                  placeholder="CF-XXXXXX"
                />
                <AgreementInputField
                  control={form.control}
                  name="mediationDate"
                  label="Mediation Date"
                  type="date"
                />
              </div>
              <AgreementTextField
                control={form.control}
                name="disputeNature"
                label="Nature of Dispute"
                placeholder="Briefly describe the nature of the dispute"
                rows={4}
              />
            </AgreementSection>

            {/* Mediation Terms */}
            <AgreementSection title="Mediation Terms">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-700" />
                <AlertTitle className="text-blue-800 font-semibold">Important Information</AlertTitle>
                <AlertDescription className="text-blue-700 space-y-1">
                  <p>Please review and confirm the following terms of mediation.</p>
                </AlertDescription>
              </Alert>

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
                        The parties understand that mediation is a voluntary process and they can withdraw at any time.
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

              <AgreementTextField
                control={form.control}
                name="costsAgreement"
                label="Costs Agreement"
                placeholder="Specify how costs will be shared between parties"
                rows={3}
              />
            </AgreementSection>

            {/* Party A Information */}
            <AgreementSection title="Party A Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AgreementInputField
                  control={form.control}
                  name="partyA.fullName"
                  label="Full Name"
                  placeholder="Full Name"
                />
                <AgreementInputField
                  control={form.control}
                  name="partyA.email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                />
                <AgreementInputField
                  control={form.control}
                  name="partyA.phone"
                  label="Phone"
                  placeholder="Phone Number"
                />
              </div>
              <AgreementTextField
                control={form.control}
                name="partyA.address"
                label="Address"
                placeholder="Full Address"
                rows={3}
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
                          By checking this box, Party A confirms they have read, understood, and agree to the terms of this Mediation Agreement.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partyA.signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature (Type Full Name)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Type full name to sign" 
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field} 
                        />
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
            </AgreementSection>

            {/* Party B Information */}
            <AgreementSection title="Party B Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AgreementInputField
                  control={form.control}
                  name="partyB.fullName"
                  label="Full Name"
                  placeholder="Full Name"
                />
                <AgreementInputField
                  control={form.control}
                  name="partyB.email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                />
                <AgreementInputField
                  control={form.control}
                  name="partyB.phone"
                  label="Phone"
                  placeholder="Phone Number"
                />
              </div>
              <AgreementTextField
                control={form.control}
                name="partyB.address"
                label="Address"
                placeholder="Full Address"
                rows={3}
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
                          By checking this box, Party B confirms they have read, understood, and agree to the terms of this Mediation Agreement.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partyB.signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature (Type Full Name)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Type full name to sign" 
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field} 
                        />
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
            </AgreementSection>

            {/* Mediator Information */}
            <AgreementSection title="Mediator Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AgreementInputField
                  control={form.control}
                  name="mediator.name"
                  label="Mediator Name"
                  placeholder="Full Name"
                />
                <AgreementInputField
                  control={form.control}
                  name="mediator.qualifications"
                  label="Qualifications"
                  placeholder="Professional qualifications"
                />
                <AgreementInputField
                  control={form.control}
                  name="mediator.email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                />
                <AgreementInputField
                  control={form.control}
                  name="mediator.phone"
                  label="Phone"
                  placeholder="Phone Number"
                />
                <AgreementInputField
                  control={form.control}
                  name="mediator.organization"
                  label="Organization"
                  placeholder="Organization or Practice"
                />
              </div>
              <AgreementTextField
                control={form.control}
                name="mediator.address"
                label="Address"
                placeholder="Full Address"
                rows={3}
              />
              <div className="pt-4 border-t mt-4">
                <FormField
                  control={form.control}
                  name="mediator.signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature (Type Full Name)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Type full name to sign" 
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field} 
                        />
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
            </AgreementSection>

            {/* Agreement Terms */}
            <AgreementSection title="Agreement Terms">
              <AgreementTextField
                control={form.control}
                name="agreementTerms"
                label="Full Agreement Terms"
                placeholder="Enter the full text of the mediation agreement terms here."
                rows={10}
              />
            </AgreementSection>

            {/* Final Agreement Date */}
            <AgreementSection title="Final Agreement Date">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AgreementInputField
                  control={form.control}
                  name="agreementDate"
                  label="Date of Agreement"
                  type="date"
                />
              </div>
            </AgreementSection>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
              <Button type="submit" size="lg" id="save-agreement-button">
                <FileText className="mr-2 h-5 w-5" /> Save Agreement
              </Button>
              <Button type="button" size="lg" onClick={handleDownloadPdf} variant="outline" id="download-pdf-button">
                <Download className="mr-2 h-5 w-5" /> Download as PDF
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}