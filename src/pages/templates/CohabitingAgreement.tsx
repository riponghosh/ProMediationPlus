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

// --- Zod Schema Definition ---
const cohabitingAgreementSchema = z.object({
  linkedCaseFileNumber: z.string().optional(),
  partyAName: z.string().min(1, "Party A name is required."),
  partyAAddress: z.string().min(1, "Party A address is required."),
  partyBName: z.string().min(1, "Party B name is required."),
  partyBAddress: z.string().min(1, "Party B address is required."),
  mediatorName: z.string().min(1, "Mediator name is required."),
  mediatorAddress: z.string().min(1, "Mediator address is required."),
  cohabitationStartDate: z.string().min(1, "Cohabitation start date is required."),
  propertyPurchaseDate: z.string().min(1, "Property purchase date is required."),
  relationshipEndDate: z.string().min(1, "Relationship end date is required."),
  numberOfChildren: z.string().optional(),
  childrenNamesAndDOBs: z.string().optional(),
  maintenanceAmount: z.string().optional(),
  maintenancePayor: z.string().optional(),
  maintenancePayee: z.string().optional(),
  maintenancePaymentDate: z.string().optional(),
  propertyDetails: z.string().optional(),
  dependentCohabitant: z.string().optional(), // "yes" or "no" or name
  sharedHomeAddress: z.string().optional(),
  partyARelinquishesClaim: z.string().optional(), // "yes" or "no"
  financialArrangements: z.string().optional(),
  childBenefitRecipient: z.string().optional(),
  spcccClaimer: z.string().optional(),
  partyASignatureName: z.string().optional(),
  partyASignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  partyBSignatureName: z.string().optional(),
  partyBSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  mediatorSignatureName: z.string().optional(),
  mediatorSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type CohabitingAgreementData = z.infer<typeof cohabitingAgreementSchema>;

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
  name: keyof CohabitingAgreementData;
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
    name: keyof CohabitingAgreementData;
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

const CohabitingAgreement: React.FC = () => {
  const isMobile = useIsMobile();
  const [caseFileNumbers, setCaseFileNumbers] = useState<string[]>([]);
  const form = useForm<CohabitingAgreementData>({
    resolver: zodResolver(cohabitingAgreementSchema),
    defaultValues: {
      linkedCaseFileNumber: undefined,
      partyAName: "",
      partyAAddress: "",
      partyBName: "",
      partyBAddress: "",
      mediatorName: "Michelle Browne", // Pre-fill based on text
      mediatorAddress: "", // To be filled if needed
      cohabitationStartDate: "",
      propertyPurchaseDate: "",
      relationshipEndDate: "",
      numberOfChildren: "",
      childrenNamesAndDOBs: "",
      maintenanceAmount: "",
      maintenancePayor: "",
      maintenancePayee: "",
      maintenancePaymentDate: "",
      propertyDetails: "",
      dependentCohabitant: "",
      sharedHomeAddress: "",
      partyARelinquishesClaim: "",
      financialArrangements: "",
      childBenefitRecipient: "",
      spcccClaimer: "",
      partyASignatureName: "",
      partyASignatureDate: new Date().toISOString().split('T')[0],
      partyBSignatureName: "",
      partyBSignatureDate: new Date().toISOString().split('T')[0],
      mediatorSignatureName: "Michelle Browne",
      mediatorSignatureDate: new Date().toISOString().split('T')[0],
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const watchedPartyAName = form.watch("partyAName");
  const watchedPartyBName = form.watch("partyBName");
  const watchedMediatorName = form.watch("mediatorName");

  useEffect(() => {
    const fetchCaseFiles = async () => {
      try {
        setCaseFileNumbers(['CASE-001', 'CASE-002', 'CASE-003']);
        console.log("Fetched case file numbers (placeholder)");
      } catch (error) {
        console.error("Failed to fetch case file numbers:", error);
        toast.error("Failed to load case file numbers for selection.");
      }
    };
    fetchCaseFiles();
  }, []);

  useEffect(() => {
    if (watchedPartyAName && !form.getValues("partyASignatureName")) {
      form.setValue("partyASignatureName", watchedPartyAName, { shouldValidate: false });
    }
  }, [watchedPartyAName, form]);

  useEffect(() => {
    if (watchedPartyBName && !form.getValues("partyBSignatureName")) {
      form.setValue("partyBSignatureName", watchedPartyBName, { shouldValidate: false });
    }
  }, [watchedPartyBName, form]);

  useEffect(() => {
    if (watchedMediatorName && !form.getValues("mediatorSignatureName")) {
      form.setValue("mediatorSignatureName", watchedMediatorName, { shouldValidate: false });
    }
  }, [watchedMediatorName, form]);

  function onSubmit(data: CohabitingAgreementData) {
    console.log("Cohabiting Agreement Data:", JSON.stringify(data, null, 2));
    toast.success("Cohabiting Agreement data saved (simulated).");
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

      pdf.save('CohabitingAgreement.pdf');
      toast.success("PDF downloaded successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. See console for details.");
    } finally {
      if (downloadButton) downloadButton.style.display = originalDownloadDisplay;
      if (saveButton) saveButton.style.display = originalSaveDisplay;
    }
  };
  
  const renderSignatureBlock = (partyType: 'Party A' | 'Party B' | 'Mediator', nameField: keyof CohabitingAgreementData, dateField: keyof CohabitingAgreementData) => (
    <div className="space-y-3 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <AgreementInputField
                control={form.control}
                name={nameField}
                label={`Signed By (${partyType}):`}
                placeholder={`Enter name of ${partyType.toLowerCase()}`}
            />
            <AgreementInputField
                control={form.control}
                name={dateField}
                label="Date:"
                type="date"
            />
        </div>
    </div>
  );


  return (
    <Layout>
      <div className={`container mx-auto px-4 py-8 ${isMobile ? "space-y-4" : "space-y-6"}`}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef} className="space-y-8 bg-white p-6 md:p-10 rounded-lg shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-8">MEDIATION SETTLEMENT</h2>
            
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

            <AgreementSection title="Cohabitant's Agreement">
              <p>THIS MEDIATION SETTLEMENT, a Cohabitant’s Agreement has been agreed with the assistance of the mediator <AgreementInputField control={form.control} name="mediatorName" label="Mediator Name" placeholder="Mediator Name" className="inline-block w-auto" /> in accordance with section 202 of the Civil Partnership and Certain Rights and Obligations of Cohabitants Act 2010, “the 2010 Act”, and the provisions of the Mediation Act 2017.</p>
              <p>Between;</p>
              <AgreementInputField control={form.control} name="partyAName" label="Party A Name" placeholder="Party A Name" />
              <p>of <AgreementInputField control={form.control} name="partyAAddress" label="Party A Address" placeholder="Party A Address" /></p>
              <p>AND</p>
              <AgreementInputField control={form.control} name="partyBName" label="Party B Name" placeholder="Party B Name" />
              <p>of <AgreementInputField control={form.control} name="partyBAddress" label="Party B Address" placeholder="Party B Address" /></p>
              <p>and</p>
              <AgreementTextField control={form.control} name="mediatorAddress" label="Mediator Address" placeholder="Name & Address of Mediator" rows={1} />
              <p>(The "Mediator").</p>
            </AgreementSection>

            <AgreementSection title="Background">
              <p>The parties lived together since <AgreementInputField control={form.control} name="cohabitationStartDate" label="Cohabitation Start Date" type="date" className="inline-block w-auto" />, they purchased a property together in <AgreementInputField control={form.control} name="propertyPurchaseDate" label="Property Purchase Date" type="date" className="inline-block w-auto" />. They are no longer in a relationship since <AgreementInputField control={form.control} name="relationshipEndDate" label="Relationship End Date" type="date" className="inline-block w-auto" />.</p>
              <p>There are <AgreementInputField control={form.control} name="numberOfChildren" label="Number of Children" placeholder="e.g., two" className="inline-block w-auto" /> child/ren of the relationship, namely <AgreementTextField control={form.control} name="childrenNamesAndDOBs" label="Children Names and DOBs" placeholder="Names, dob" rows={1} />.</p>
              <p>The parties agree, in accordance with section 11 (1)(b) of the Mediation Act 2017 "The Act", that they intend these mediated terms to be legally binding upon each of them. The parties also acknowledge that in accordance with section 8 (2)(d) of the Act that they have been advised by the mediators to seek legal advice before signing this Agreement, and in accordance with section 202(2)(a)(ii) of the Civil Partnership and Certain Rights and Obligations of Cohabitants Act 2010 have agreed to waive the right to independent legal advice and have received legal advice separately and hereby covenant and agree with each other as follows:</p>
              <p>It is agreed that; This Agreement is deemed to be a valid agreement in accordance with section 202 of the 2010 Act as;</p>
              <ul className="list-disc list-inside ml-4">
                <li>the parties have received legal advice separately in accordance with section 202 (2)(a)(ii) of the 2010 Act.</li>
                <li>the agreement is in writing and signed by both cohabitants, and</li>
                <li>the general law of contract is complied with.</li>
              </ul>
            </AgreementSection>

            <AgreementSection title="Children">
              <p>The parties acknowledge that they wish to be joint guardians of the children of the relationship while the child is under the age of 18, parents agree they will apply to the courts so for guardianship of the children at the earliest possible convenience.</p>
              <p>Both parties agree to carry out the parenting arrangements agreed and set out in the parenting section below, and any subsequent amendments to that agreement that they may agree from time to time.</p>
              <p>The parties agree that they will to the greatest possible extent consult with each other on all matters affecting their child’s education, training, career prospects, medical care and treatment; and general health, well-being and welfare. They each agree to notify the other party immediately if the child becomes seriously ill; and, in particular, if he should be admitted to hospital.</p>
              <p>Both parties each agree that at all times they will each support the relationship of the child with both parents.</p>
              <p>The parties agree that they will share time with the child/ren, to be agreed between the parties in the best interests of the children.</p>
              <p>It is further agreed by both parties that they will share in all special occasions for the child/ren.</p>
              <p>Both parties agree that the other parent may take the child/ren out of the county on holiday, with information on the location and contact information to be supplied to the non-vacationing parent at least four weeks in advance of agreed holiday.</p>
            </AgreementSection>

            <AgreementSection title="Maintenance">
              <p>The parties agree the following in relation to maintenance. It has been agreed that <AgreementInputField control={form.control} name="maintenancePayor" label="Maintenance Payor" placeholder="Payor Name" className="inline-block w-auto" /> will pay <AgreementInputField control={form.control} name="maintenancePayee" label="Maintenance Payee" placeholder="Payee Name" className="inline-block w-auto" /> <AgreementInputField control={form.control} name="maintenanceAmount" label="Maintenance Amount" placeholder="e.g., €X" className="inline-block w-auto" /> per month as maintenance for the dependent children, until they each reach the age of 23, or until they reach the age of 18 if they are on longer in full-time education. Said payment is to be made on the <AgreementInputField control={form.control} name="maintenancePaymentDate" label="Payment Date" placeholder="e.g., 25th" className="inline-block w-auto" /> of the month by inter-bank transfer into the account of <AgreementInputField control={form.control} name="maintenancePayee" label="Maintenance Payee Account" placeholder="Payee Name" className="inline-block w-auto" />.</p>
              <p>It is further agreed that, should the financial circumstances of either party fundamentally change; that the payor has liberty to seek to revise their contribution downwards.</p>
            </AgreementSection>

            <AgreementSection title="Property">
              <p>(whereby property has been shared or either party own property, details should be outlined accordingly).</p>
              <AgreementTextField control={form.control} name="propertyDetails" label="Property Details" placeholder="Details of property shared or owned" rows={3} />
              <p>It is agreed neither party was a dependent co-habitant during the relationship or it has been agreed that party <AgreementInputField control={form.control} name="dependentCohabitant" label="Dependent Cohabitant" placeholder="e.g., Party A" className="inline-block w-auto" /> was a dependent cohabitant.</p>
              <p>It has been agreed between both parties that party A <AgreementInputField control={form.control} name="partyARelinquishesClaim" label="Party A Relinquishes Claim" placeholder="e.g., will relinquish all rights" className="inline-block w-auto" /> on the previously shared home at <AgreementTextField control={form.control} name="sharedHomeAddress" label="Shared Home Address" placeholder="Shared Home Address" rows={1} /> or it has been agreed between the parties (insert decision reached).</p>
              <p>It has further been agreed that party A <AgreementInputField control={form.control} name="partyARelinquishesClaim" label="Party A Paperwork" placeholder="e.g., shall sign any necessary paperwork" className="inline-block w-auto" /> in relation to agreement made. (insert as applicable, ie whereby either party relinquishes a claim on property etc..)</p>
            </AgreementSection>

            <AgreementSection title="Financial">
              <p>The following financial arrangements have been agreed between the parties:</p>
              <AgreementTextField control={form.control} name="financialArrangements" label="Financial Arrangements" placeholder="Details of financial arrangements" rows={3} />
              <p>It has been agreed between both parties that all bank accounts and policies, currently in one another’s name are to remain in one another’s name and there is no claim being made by either party in relation to such sole name accounts, details of which are set out in the Statement of means provided by each party and attached as Appendix A.</p>
              <p>It is agreed that any debt that either party has set out in their respective Statement of Means remains the debt of that party.</p>
              <p>The parties agree that party A <AgreementInputField control={form.control} name="childBenefitRecipient" label="Child Benefit Recipient" placeholder="e.g., Party A" className="inline-block w-auto" /> will receive the Child Benefit Allowance.</p>
              <p>The parties agree that the Single Person Child Carer Credit (SPCCC) for so long as it applies, will be claimed by Party A <AgreementInputField control={form.control} name="spcccClaimer" label="SPCCC Claimer" placeholder="e.g., Party A" className="inline-block w-auto" /> (insert detail where they apply).</p>
            </AgreementSection>

            <AgreementSection title="General">
              <p>The parties hereby agree for all purposes and in particular for the purposes of any proceedings brought by either of them that it is their intention that this Agreement constitutes proper provision and is in full and final settlement of all present and future property claims which either of them may have against the other under the 2010 Act, or otherwise or under any Act of the Oireachtas, amending the said Act or Acts.</p>
              <p>The parties acknowledge and confirm that they have been advised of the meaning and effects of the provisions of the 2010 Act.</p>
              <p>The parties and their respective Personal Representatives, Attorneys or Agents shall at all times hereafter, execute and do all such assurances, acts and things as the other of them or his or her Personal Representatives, Attorneys or Agents shall reasonably require for the purpose of giving full effect to the provisions of this Agreement, including securing property adjustment orders in accordance with section 174 if required for tax purposes.</p>
              <p>In this Agreement, wherever reference is made to any Act of the Oireachtas such reference shall include reference to Act of the Oireachtas amending, modifying, replacing or re-enacting the relevant Act.</p>
              <p>It is acknowledged that this agreement is a Mediation Settlement as defined in section 2 (1)(o) of the 2017 Act, which the parties have reached in accordance with section 11 (1)(a) of the Act, and which they have determined is to be enforceable between them as provided in section 11 (1)(b). Furthermore, the parties confirm that this agreement has been reached on the basis of full and mutual disclosure of assets, set out in their respective Statements of Means, attached in Appendix A.</p>
              <p>In the event that the parties are unable to resolve any problems arising in relation to this Agreement, they agree to first seek to resolve any such difficulties in mediation, unless immediate injunctive relief is appropriate and required in the circumstances.</p>
            </AgreementSection>

            <AgreementSection title="Executed by; Parties;">
              <p>Having read this AGREEMENT, and agreeing to its terms and conditions, and acting in good faith without coercion, duress, or undue influence of any kind, and having availed of the opportunity to seek independent legal advice, we the undersigned, lay our Hands and Seals upon this AGREEMENT, giving our consent and pledge to abide by this Agreement at all times henceforth. This agreement shall be governed by the laws of Ireland, and any part of which is determined to be contrary to such laws, shall not invalidate the remainder of this Agreement.</p>
              <p>Party A <AgreementInputField control={form.control} name="partyASignatureName" label="Party A Signature Name" placeholder="Party A Signature Name" /></p>
              <p>Date : <AgreementInputField control={form.control} name="partyASignatureDate" label="Party A Signature Date" type="date" /></p>
              <p>Party B. <AgreementInputField control={form.control} name="partyBSignatureName" label="Party B Signature Name" placeholder="Party B Signature Name" /></p>
              <p>Date : <AgreementInputField control={form.control} name="partyBSignatureDate" label="Party B Signature Date" type="date" /></p>
              <p>Signed by <AgreementInputField control={form.control} name="mediatorSignatureName" label="Mediator Signature Name" placeholder="Mediator Signature Name" /> Date <AgreementInputField control={form.control} name="mediatorSignatureDate" label="Mediator Signature Date" type="date" /></p>
              <p>Family Mediator on behalf of Professional Mediation Services for Families Ireland Limited</p>
            </AgreementSection>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-10 pt-6 border-t">
              <Button id="save-agreement-button" type="submit" variant="default" size="lg" className="w-full sm:w-auto">
                Save Agreement Data
              </Button>
              <Button id="download-pdf-button" type="button" variant="outline" size="lg" onClick={handleDownloadPdf} className="w-full sm:w-auto">
                Download as PDF
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default CohabitingAgreement;