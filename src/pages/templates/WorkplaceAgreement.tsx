import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Link } from 'react-router-dom'; // Added Link import
import { ChevronLeft, Download, FileText, Info } from 'lucide-react'; // Added icons
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert components
import { getAllCaseFileNumbers } from '@/services/localDbService'; // Corrected import for case file numbers

// --- Zod Schema Definition ---
const workplaceAgreementSchema = z.object({
  linkedCaseFileNumber: z.string().optional(),
  party1Name: z.string().min(1, "Party 1 name is required."),
  party2Name: z.string().min(1, "Party 2 name is required."),
  mediatorName: z.string().optional(), // Added for mediator auto-population
  agreementDate: z.string().min(1, "Agreement date is required."),
  // Add signature fields
  party1SignatureName: z.string().optional(),
  party1SignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  party2SignatureName: z.string().optional(),
  party2SignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  mediatorSignatureName: z.string().optional(),
  mediatorSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type WorkplaceAgreementData = z.infer<typeof workplaceAgreementSchema>;

// --- Helper Component for Sections ---
interface SectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

const AgreementSection: React.FC<SectionProps> = ({ title, children, description, className }) => (
  <div className={`space-y-4 p-4 md:p-6 border rounded-lg bg-slate-50/50 ${className}`}>
    <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
      {children}
    </div>
  </div>
);

// --- Helper Component for Input Fields ---
interface AgreementInputFieldProps {
  control: any;
  name: keyof WorkplaceAgreementData;
  label: string;
  description?: string;
  placeholder?: string;
  type?: string;
  className?: string;
}

const AgreementInputField: React.FC<AgreementInputFieldProps> = ({ control, name, label, description, placeholder, type = "text", className }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="font-medium text-gray-700">{label}</FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
        <FormControl>
          <Input
            type={type}
            placeholder={placeholder}
            {...field}
            value={field.value || ""}
            className="bg-white"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

// --- Helper Component for Text Fields (Textarea) ---
interface AgreementTextFieldProps {
    control: any;
    name: keyof WorkplaceAgreementData;
    label: string;
    description?: string;
    placeholder?: string;
    rows?: number;
    className?: string;
}

const AgreementTextField: React.FC<AgreementTextFieldProps> = ({ control, name, label, description, placeholder, rows = 3, className }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem className={className}>
                <FormLabel className="font-medium text-gray-700">{label}</FormLabel>
                {description && <FormDescription>{description}</FormDescription>}
                <FormControl>
                    <Textarea
                        placeholder={placeholder || `Details for ${label.toLowerCase()}...`}
                        rows={rows}
                        {...field}
                        value={field.value || ""}
                        className="bg-white"
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);

const WorkplaceAgreementBuilder: React.FC = () => { // Renamed export
  const isMobile = useIsMobile();
  const [caseFileNumbers, setCaseFileNumbers] = useState<string[]>([]);
  const form = useForm<WorkplaceAgreementData>({
    resolver: zodResolver(workplaceAgreementSchema),
    defaultValues: {
      linkedCaseFileNumber: undefined,
      party1Name: "",
      party2Name: "",
      mediatorName: "", // Added to default values
      agreementDate: new Date().toISOString().split('T')[0], // Default to today's date
      party1SignatureName: "",
      party1SignatureDate: new Date().toISOString().split('T')[0],
      party2SignatureName: "",
      party2SignatureDate: new Date().toISOString().split('T')[0],
      mediatorSignatureName: "",
      mediatorSignatureDate: new Date().toISOString().split('T')[0],
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const watchedParty1Name = form.watch("party1Name");
  const watchedParty2Name = form.watch("party2Name");
  const watchedMediatorName = form.watch("mediatorName"); // Watch mediator name

  useEffect(() => {
    const fetchCaseFiles = async () => {
      try {
        const numbers = await getAllCaseFileNumbers(); // Use actual service
        setCaseFileNumbers(numbers);
      } catch (error) {
        console.error("Failed to fetch case file numbers:", error);
        toast.error("Failed to load case file numbers for selection.");
      }
    };
    fetchCaseFiles();
  }, []);

  useEffect(() => {
    if (watchedParty1Name && !form.getValues("party1SignatureName")) {
      form.setValue("party1SignatureName", watchedParty1Name, { shouldValidate: false });
    }
  }, [watchedParty1Name, form]);

  useEffect(() => {
    if (watchedParty2Name && !form.getValues("party2SignatureName")) {
      form.setValue("party2SignatureName", watchedParty2Name, { shouldValidate: false });
    }
  }, [watchedParty2Name, form]);

  useEffect(() => {
    if (watchedMediatorName && !form.getValues("mediatorSignatureName")) {
      form.setValue("mediatorSignatureName", watchedMediatorName, { shouldValidate: false });
    }
  }, [watchedMediatorName, form]);

  function onSubmit(data: WorkplaceAgreementData) {
    console.log("Workplace Agreement Data:", JSON.stringify(data, null, 2));
    toast.success("Workplace Agreement data saved (simulated).");
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

      pdf.save('WorkplaceAgreement.pdf');
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
                    <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Workplace Agreement</h1>
                    <p className="text-muted-foreground text-sm">
                        Create a detailed agreement for workplace mediation.
                    </p>
                </div>
            </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef} className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
            <FormField
                control={form.control}
                name="linkedCaseFileNumber"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-medium text-gray-700">Link to Case File (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select a case file number" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="__NONE__">None</SelectItem>
                                {caseFileNumbers.length > 0 ? (
                                    caseFileNumbers.map((num) => (
                                        <SelectItem key={num} value={num}>{num}</SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-cases" disabled>No case files available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Alert variant="default" className="bg-purple-50 border-purple-200">
                <Info className="h-4 w-4 text-purple-700" />
                <AlertTitle className="text-purple-800 font-semibold">Guidance & Template</AlertTitle>
                <AlertDescription className="text-purple-700 space-y-1">
                    <p>This form helps you structure a Workplace Agreement based on a template. Fill in the details as accurately as possible.</p>
                    <p>It is strongly advised that both parties seek independent advice before signing any agreement. This template is for guidance and may need adaptation to specific circumstances.</p>
                </AlertDescription>
            </Alert>

            <h1 className="text-2xl font-bold text-center text-purple-800">ORGANISATIONAL & WORKPLACE AGREEMENT</h1>

            <AgreementSection title="Agreement to Mediate">
              <p>This document relates to a Mediation process between</p>
              <AgreementInputField control={form.control} name="party1Name" label="Party 1 Name" placeholder="Enter Party 1's full name" />
              <p>and</p>
              <AgreementInputField control={form.control} name="party2Name" label="Party 2 Name" placeholder="Enter Party 2's full name" />
              <p>(If applicable insert Name, address, and relationship of any additional attendees e.g., Union official)</p>
              <p>Mediation is a process in which an independent, neutral Mediator assists two or more disputing parties in resolving the dispute in a collaborative, consensual manner.</p>
            </AgreementSection>

            <AgreementSection title="The Mediator">
              <AgreementInputField control={form.control} name="mediatorName" label="Mediator Name" placeholder="Enter Mediator's full name" />
              <p>The Parties Agree to the Mediator conducting the Mediation process. The Mediator is accredited to the Mediators’ Institute of Ireland and acting in accordance with its Code of Ethics and Practice (available at www.themii.ie ). The Mediator will act as an impartial facilitator to assist the parties in a negotiation aimed at the resolution of issues between them. All parties will work with the Mediator to isolate points of agreement and disagreement, to identify their interests, to explore alternative solutions and to consider compromises or accommodations. The Mediator will not decide or indicate who is right or who is wrong or make decisions related to the outcome of the Mediation. The Mediator is committed to processing parties’ personal information fairly and in compliance with the Code of Ethics and Practice, The Mediation Act 2017, GDPR legislation and Data Protection Act 2018.</p>
            </AgreementSection>

            <AgreementSection title="Parties agree the following:">
              <ol className="list-decimal list-inside space-y-2">
                <li>I am entering Mediation in good faith and will endeavour to resolve the issues of conflict through this process. To ensure the Mediation is conducted in line with best practice the Mediator may make requests of the parties during the Mediation and/or any caucus/breakout session. I undertake to consider these requests in the interest and spirit of progressing matters in the Mediation in a constructive and respectful manner. I will disclose fully and in a timely manner any information and/or documents relevant to the matters under discussion.</li>
                <li>I understand that it is for the parties to the Mediation with the Mediator’s concurrence, to determine the scope of the Mediation. I acknowledge that the Mediator will not decide or indicate who is right or who is wrong or make decisions related to the outcome of the Mediation.</li>
                <li>I understand that the Mediator does not offer advice of any kind and therefore parties are encouraged to exercise their right to obtain independent advice (including legal, financial, tax and any other professional advice) prior to engaging in and during the Mediation process and, most importantly, before signing any Mediated Settlement/Memorandum of Understanding. The onus is on me as a party to the Mediation process to request time to avail of such advice when I consider it appropriate and relevant.</li>
                <li>As a party to the Mediation process I understand that I may be accompanied to the Mediation and assisted by a person who is not a party. This includes but is not limited to an advisor, supporter or representative and the onus is on me as a party to determine if I require such support.</li>
                <li>I understand that information gathered in the Mediation process is confidential and privileged. Neither the Mediator nor any party to the Mediation including any accompanying person or persons shall divulge any information gained in the Mediation process nor seek to have the Mediator or any party to the Mediation divulge information relevant to that Mediation in any setting whatsoever. If it is necessary for a third party to be consulted in the context of a solution, prior agreement will be sought from the parties to the dispute.</li>
                <li>I agree that if the Mediator asks me to break out of the plenary meeting into a private meeting/caucus session, I will do so.</li>
                <li>If during a Mediation meeting, I believe it is no longer possible to continue with the Mediation, I agree to meet briefly with the Mediator in private session prior to withdrawing.</li>
                <li>I understand that the Mediator may terminate the Mediation meeting in circumstances where they believe it is not appropriate to proceed.</li>
                <li>I understand that the confidentiality of the Mediation process shall not excuse the Mediator's duty to act as required to do so by law, to report any threat of or actual physical or psychological injury to a party; attempt to commit or conceal a crime; concern as to welfare and safety of a child or children, revealed during the process.</li>
                <li>I understand that the Mediator will have opened a file containing details of this Mediation process from our first interactions and that they are obliged to keep this file in a secure place for 7 years after the Mediation concludes.</li>
                <li>All communications (including oral statements) and all records and notes relating to the Mediation shall be confidential and shall not be disclosed in any proceedings before a court or otherwise. The following are the only exceptions to this - where disclosure is:
                  <ul className="list-disc list-inside ml-4">
                    <li>Necessary to implement or enforce a Mediated Settlement/Memorandum of Understanding</li>
                    <li>Necessary to prevent physical or psychological injury to a party</li>
                    <li>Required by law</li>
                    <li>Necessary in the interests of preventing or revealing – the commission of a crime (including an attempt to commit a crime) the concealment of a crime, or a threat to a party</li>
                    <li>Sought or offered to prove or disprove a civil claim concerning the negligence or misconduct of the Mediator occurring during the Mediation or a complaint to a professional body concerning such negligence or misconduct.</li>
                  </ul>
                </li>
                <li>I agree that all devices with the capability of recording have their recording capability disabled. This includes mobile phones, cameras, tape recorders or other devices capable of recording such as Amazon Alexa or Google nest. I confirm that I will not record any meetings including caucus/breakout sessions.</li>
                <li>I agree that the Mediator will not be liable for any mistake or omission made during this Mediation unless this mistake or omission is fraudulent or negligent.</li>
                <li>I agree to the Mediation taking place online (amend/delete as required) to expedite the process and therefore commit to joining the meeting from a private setting to maintain confidentiality.</li>
              </ol>
              <h3>Virtual Meetings (Delete if not applicable)</h3>
              <ol className="list-alpha list-inside ml-4 space-y-2">
                <li>Parties involved in virtual meetings are required to comply with GDPR legislation and Data Protection Act 2018.</li>
                <li>Where all parties and the Mediator agree to a virtual meeting, each is committing that that they will not make any digital/audio recordings of online meetings nor permit any meeting participants to make any digital recording of confidential meetings. This includes caucus/breakout sessions.</li>
                <li>In agreeing to take part in Mediation via virtual platform, parties are confirming their technical competence in Zoom/Webex/Microsoft (amend/delete as required) to take part on a virtual platform</li>
                <li>Parties and the Mediator commit to conducting the virtual Mediation and any related caucus or breakout session in an enclosed, private space where they cannot be overheard, seen, or monitored either in person or electronically by a third party not involved in the Mediation</li>
                <li>All parties agree to identify all persons who are present in the room at any time during the Mediation or caucus/breakout session.</li>
                <li>All parties attending a virtual meeting agree not to share the login details of the virtual meeting with any other person.</li>
              </ol>
              <p>Parties will treat each other respectfully and will be mindful of gestures, tone, and language throughout the process.</p>
              <p>Mediation Fees will be agreed separately with (Insert Person in organisation paying fees) who will be responsible for paying the Mediator fees.</p>
              <p>The undersigned, having read and understood the above, consent to participating in Mediation.</p>
            </AgreementSection>

            <AgreementSection title="Signatures">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Party 1 Signature */}
                <div className="space-y-2 border p-4 rounded-md text-center">
                    <FormLabel className="font-semibold">Party 1</FormLabel>
                    <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"></div>
                    <AgreementInputField control={form.control} name="party1SignatureName" label="Name (Party 1)" placeholder="Party 1 Printed Name" />
                    <AgreementInputField control={form.control} name="party1SignatureDate" label="Date" type="date" />
                </div>
                {/* Party 2 Signature */}
                <div className="space-y-2 border p-4 rounded-md text-center">
                    <FormLabel className="font-semibold">Party 2</FormLabel>
                    <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"></div>
                    <AgreementInputField control={form.control} name="party2SignatureName" label="Name (Party 2)" placeholder="Party 2 Printed Name" />
                    <AgreementInputField control={form.control} name="party2SignatureDate" label="Date" type="date" />
                </div>
                {/* Mediator Signature */}
                <div className="space-y-2 border p-4 rounded-md text-center">
                    <FormLabel className="font-semibold">Mediator</FormLabel>
                    <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"></div>
                    <AgreementInputField control={form.control} name="mediatorSignatureName" label="Name (Mediator)" placeholder="Mediator Printed Name" />
                    <AgreementInputField control={form.control} name="mediatorSignatureDate" label="Date" type="date" />
                    <FormDescription className="text-xs">Signed by the mediator in accordance with section 2(1)(o) Mediation Act 2017</FormDescription>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">NOTE: If Mediation is to take place on a digital platform, parties’ agreement to the terms here within can be confirmed via email to the Mediator.</p>
            </AgreementSection>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
              <Button id="save-agreement-button" type="submit" size="lg">
                <FileText className="mr-2 h-5 w-5" /> Save Agreement Data
              </Button>
              <Button id="download-pdf-button" type="button" variant="outline" size="lg" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-5 w-5" /> Download as PDF
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default WorkplaceAgreementBuilder;