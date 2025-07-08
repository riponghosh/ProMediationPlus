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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CalendarDays, Download, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  signaturePlaceholder: z.string().optional(), // For typed signature
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
  signaturePlaceholder: z.string().optional(), // For typed signature
  signatureDate: z.string().optional(),
});

// Define schema for the entire form
const agreementToMediateSchema = z.object({
  linkedCaseFileNumber: z.string().optional(), // Added for case file number
  caseReference: z.string().min(1, { message: "Case reference is required" }),
  mediationDate: z.string().min(1, { message: "Mediation date is required" }),
  disputeNature: z.string().min(5, { message: "Description of dispute is required" }),
  
  voluntaryParticipation: z.boolean().default(true),
  confidentiality: z.boolean().default(true),
  legalAdvice: z.boolean().default(true),
  mediationFormat: z.enum(["inPerson", "online", "hybrid"]).default("inPerson"),
  costsAgreement: z.string().min(1, { message: "Costs agreement is required" }),
  
  partyA: partySchema,
  partyB: partySchema,
  mediator: mediatorSchema,

  additionalNotes: z.string().optional(),

  // Signatures
  partyASignatureName: z.string().optional(),
  partyASignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  partyBSignatureName: z.string().optional(),
  partyBSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  mediatorSignatureName: z.string().optional(),
  mediatorSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type AgreementToMediateFormValues = z.infer<typeof agreementToMediateSchema>;

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
    name: keyof AgreementToMediateFormValues;
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
    name: keyof AgreementToMediateFormValues;
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

// TODO: Add props to receive initial party names if available
export function AgreementToMediateForm() {
  const [caseFileNumbers, setCaseFileNumbers] = useState<string[]>([]);
  const form = useForm<AgreementToMediateFormValues>({
    resolver: zodResolver(agreementToMediateSchema),
    defaultValues: {
      linkedCaseFileNumber: undefined,
      caseReference: "",
      mediationDate: new Date().toISOString().split('T')[0],
      disputeNature: "",
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
        signaturePlaceholder: "",
        signatureDate: new Date().toISOString().split('T')[0],
      },
      partyB: {
        fullName: "",
        address: "",
        phone: "",
        email: "",
        agreed: false,
        signaturePlaceholder: "",
        signatureDate: new Date().toISOString().split('T')[0],
      },
      mediator: {
        name: "",
        qualifications: "",
        organization: "",
        address: "",
        phone: "",
        email: "",
        signaturePlaceholder: "",
        signatureDate: new Date().toISOString().split('T')[0],
      },
      additionalNotes: "",
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
    if (watchedPartyAName && !form.getValues("partyA.signaturePlaceholder")) {
      form.setValue("partyA.signaturePlaceholder", watchedPartyAName, { shouldValidate: false });
    }
}, [watchedPartyAName, form]);

React.useEffect(() => {
    if (watchedPartyBName && !form.getValues("partyBSignatureName")) {
        form.setValue("partyBSignatureName", watchedPartyBName, { shouldValidate: false });
    }
    if (watchedPartyBName && !form.getValues("partyB.signaturePlaceholder")) {
      form.setValue("partyB.signaturePlaceholder", watchedPartyBName, { shouldValidate: false });
    }
}, [watchedPartyBName, form]);

React.useEffect(() => {
    if (watchedMediatorName && !form.getValues("mediatorSignatureName")) {
        form.setValue("mediatorSignatureName", watchedMediatorName, { shouldValidate: false });
    }
    if (watchedMediatorName && !form.getValues("mediator.signaturePlaceholder")) {
      form.setValue("mediator.signaturePlaceholder", watchedMediatorName, { shouldValidate: false });
    }
}, [watchedMediatorName, form]);

  function onSubmit(data: AgreementToMediateFormValues) {
    console.log("Agreement to Mediate Data:", JSON.stringify(data, null, 2));
    toast.success("Agreement to Mediate data saved (simulated).");
    // TODO: Send data to backend, generate document, etc.
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

        pdf.save('AgreementToMediate.pdf');
        toast.success("PDF downloaded successfully!");

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF. See console for details.");
    } finally {
        if (downloadButton) downloadButton.style.display = originalDownloadDisplay;
        if (saveButton) saveButton.style.display = originalSaveDisplay;
    }
};

  const renderPartySection = (party: "partyA" | "partyB", partyLabel: string) => (
    <AgreementSection title={`${partyLabel} Information`}>
      <AgreementInputField
        control={form.control}
        name={`${party}.fullName`}
        label="Full Name"
        placeholder="Full Name"
      />
      <AgreementInputField
        control={form.control}
        name={`${party}.email`}
        label="Email"
        type="email"
        placeholder="Email"
      />
      <AgreementInputField
        control={form.control}
        name={`${party}.phone`}
        label="Phone"
        placeholder="Phone Number"
      />
      <AgreementTextField
        control={form.control}
        name={`${party}.address`}
        label="Address"
        placeholder="Full Address"
        rows={3}
      />
      <div className="pt-4 border-t mt-4">
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
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${party}.signaturePlaceholder`}
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
          name={`${party}.signatureDate`}
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
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Agreement to Mediate</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef} className="space-y-8 max-w-3xl mx-auto p-6 border rounded-lg shadow-md bg-white">
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
          <AgreementSection title="Case Information">
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
            <AgreementTextField
              control={form.control}
              name="disputeNature"
              label="Nature of Dispute"
              placeholder="Briefly describe the nature of the dispute"
              rows={3}
            />
          </AgreementSection>

          <AgreementSection title="Mediation Terms">
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

          {renderPartySection("partyA", "Party A")}
          {renderPartySection("partyB", "Party B")}

          <AgreementSection title="Mediator Information">
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
            <AgreementTextField
              control={form.control}
              name="mediator.address"
              label="Address"
              placeholder="Full Address"
              rows={3}
            />
            <FormField
              control={form.control}
              name="mediator.signaturePlaceholder"
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
          </AgreementSection>

          <AgreementTextField
            control={form.control}
            name="additionalNotes"
            label="Additional Notes or Stipulations"
            placeholder="Record any specific agreements or notes related to the mediation process..."
            rows={3}
          />

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
  );
}