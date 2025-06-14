import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added Select
import { Layout } from '@/components/layout/layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import { getAllCaseFileNumbers } from '@/services/caseService'; // Assuming a service to get case file numbers

// --- Zod Schema Definition ---
const commercialAgreementSchema = z.object({
  linkedCaseFileNumber: z.string().optional(), // Ensured this is present
  agreementMadeDay: z.string().min(1, "Day is required."),
  agreementMadeMonth: z.string().min(1, "Month is required."),
  agreementMadeYear: z.string().min(1, "Year is required.").default(new Date().getFullYear().toString()),
  firstPartyName: z.string().min(1, "First Party's name is required."),
  secondPartyName: z.string().min(1, "Second Party's name is required."),
  mediatorNameAndAddress: z.string().min(1, "Mediator's name and address are required."),
  
  // Optional fields for venue, fees, data retention if they become dynamic
  venueDetails: z.string().optional().describe("Details of venue for mediation sessions."),
  feeDetails: z.string().optional().describe("Hourly rate or daily rate, including charges for services outside mediation time."),
  preMediationFeeDetails: z.string().optional().describe("Fees payable if mediation doesn't occur or is adjourned."),
  dataRetentionPolicyLink: z.string().optional().describe("Link or reference to the mediator's data retention policy."),

  // Signatures
  firstPartySignatureName: z.string().optional(),
  firstPartySignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  secondPartySignatureName: z.string().optional(),
  secondPartySignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
  mediatorSignatureName: z.string().optional(),
  mediatorSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type CommercialAgreementData = z.infer<typeof commercialAgreementSchema>;

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
  name: keyof CommercialAgreementData;
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
    name: keyof CommercialAgreementData;
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


const CommercialAgreementBuilder: React.FC = () => {
  const isMobile = useIsMobile();
  const [caseFileNumbers, setCaseFileNumbers] = useState<string[]>([]); // Added state for case file numbers
  const form = useForm<CommercialAgreementData>({
    resolver: zodResolver(commercialAgreementSchema),
    defaultValues: {
      linkedCaseFileNumber: undefined,
      agreementMadeDay: new Date().getDate().toString(),
      agreementMadeMonth: (new Date().getMonth() + 1).toString(), // Month is 0-indexed
      agreementMadeYear: new Date().getFullYear().toString(),
      firstPartyName: "",
      secondPartyName: "",
      mediatorNameAndAddress: "",
      venueDetails: "",
      feeDetails: "",
      preMediationFeeDetails: "",
      dataRetentionPolicyLink: "",
      firstPartySignatureName: "",
      firstPartySignatureDate: new Date().toISOString().split('T')[0],
      secondPartySignatureName: "",
      secondPartySignatureDate: new Date().toISOString().split('T')[0],
      mediatorSignatureName: "",
      mediatorSignatureDate: new Date().toISOString().split('T')[0],
    },
  });

  const formRef = React.useRef<HTMLFormElement>(null);

  const watchedFirstPartyName = form.watch("firstPartyName");
  const watchedSecondPartyName = form.watch("secondPartyName");
  // Assuming mediator name might be part of mediatorNameAndAddress, adjust if it's separate
  // const watchedMediatorName = form.watch("mediatorName"); 


  useEffect(() => { // Added useEffect for fetching case file numbers (template)
    const fetchCaseFiles = async () => {
      try {
        // const numbers = await getAllCaseFileNumbers(); // Example, replace with actual service call
        // setCaseFileNumbers(numbers);
        // For now, using placeholder data:
        setCaseFileNumbers(['CASE-001', 'CASE-002', 'CASE-003']); 
        console.log("Fetched case file numbers (placeholder)");
      } catch (error) {
        console.error("Failed to fetch case file numbers:", error);
        toast.error("Failed to load case file numbers for selection.");
      }
    };
    fetchCaseFiles();
  }, []);

  React.useEffect(() => {
    if (watchedFirstPartyName && !form.getValues("firstPartySignatureName")) {
      form.setValue("firstPartySignatureName", watchedFirstPartyName, { shouldValidate: false });
    }
  }, [watchedFirstPartyName, form]);

  React.useEffect(() => {
    if (watchedSecondPartyName && !form.getValues("secondPartySignatureName")) {
      form.setValue("secondPartySignatureName", watchedSecondPartyName, { shouldValidate: false });
    }
  }, [watchedSecondPartyName, form]);
  
  // Effect for mediator signature name if applicable
  // React.useEffect(() => {
  //   if (watchedMediatorName && !form.getValues("mediatorSignatureName")) {
  //     form.setValue("mediatorSignatureName", watchedMediatorName, { shouldValidate: false });
  //   }
  // }, [watchedMediatorName, form]);


  function onSubmit(data: CommercialAgreementData) {
    console.log("Commercial Agreement Data:", JSON.stringify(data, null, 2));
    toast.success("Commercial Agreement data saved (simulated).");
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
    
    // Ensure all content is visible for html2canvas
    // May need to temporarily expand any collapsed sections if applicable

    try {
      const canvas = await html2canvas(formElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: formElement.scrollWidth,
        windowHeight: formElement.scrollHeight,
        // Allow Taint can be problematic, useCORS is preferred
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

      pdf.save('CommercialMediationAgreement.pdf');
      toast.success("PDF downloaded successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. See console for details.");
    } finally {
      if (downloadButton) downloadButton.style.display = originalDownloadDisplay;
      if (saveButton) saveButton.style.display = originalSaveDisplay;
    }
  };
  
  const renderSignatureBlock = (partyType: 'First Party' | 'Second Party' | 'Mediator', nameField: keyof CommercialAgreementData, dateField: keyof CommercialAgreementData) => (
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
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-8">COMMERCIAL MEDIATION AGREEMENT</h2>
            
            <FormField // Added Link to Case File dropdown
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

            <AgreementSection title="Agreement Details" className="bg-slate-50/50">
              <p className="text-center mb-6">
                This AGREEMENT TO MEDIATE is made this
                <FormField
                    control={form.control}
                    name="agreementMadeDay"
                    render={({ field }) => (
                        <FormItem className="inline-block mx-1">
                            <FormControl><Input {...field} placeholder="Day" className="w-16 text-center border-b border-gray-500 focus:border-blue-500" /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                 day of
                <FormField
                    control={form.control}
                    name="agreementMadeMonth"
                    render={({ field }) => (
                        <FormItem className="inline-block mx-1">
                            <FormControl><Input {...field} placeholder="Month" className="w-24 text-center border-b border-gray-500 focus:border-blue-500" /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="agreementMadeYear"
                    render={({ field }) => (
                        <FormItem className="inline-block mx-1">
                            <FormControl><Input {...field} placeholder="Year" className="w-20 text-center border-b border-gray-500 focus:border-blue-500" /></FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AgreementInputField control={form.control} name="firstPartyName" label="First Party Name" placeholder="Enter First Party\'s full name" />
                <AgreementInputField control={form.control} name="secondPartyName" label="Second Party Name" placeholder="Enter Second Party\'s full name" />
              </div>
              <AgreementTextField control={form.control} name="mediatorNameAndAddress" label="Mediator Name & Address" placeholder="Enter Mediator\'s full name and address" rows={3}/>
            </AgreementSection>

            <AgreementSection title="THE PARTIES AND THE MEDIATOR AGREE AS FOLLOWS;">
              <p>This Agreement to Mediate sets out the terms on which the Parties agree to mediate with the assistance of the Mediator who is being appointed by the Parties as Mediator, including the scope of the work to be undertaken and the basis upon which fees will be charged, in accordance with the provisions of the Mediation Act 2017, “the Act”.</p>
              <p>The Parties acknowledge and accept that the appointment of the Mediator comes into effect upon the execution of this Agreement by the Parties and by the Mediator, and agree with the assistance of the Mediator, to try to settle the issue/s in dispute by mediation as per the provisions of this Agreement and unconditionally agree to its terms.</p>
              <p>The Parties hereby undertake to participate in a forthright, bona fide manner at all times during mediation and to make genuine efforts to negotiate a reasonable resolution of the issue/s in dispute. Furthermore, the Parties agree to negotiate in good faith, to include;</p>
              <p className="ml-4">(a) a willingness to consider putting forward options for the resolution of the dispute, and</p>
              <p className="ml-4">(b) a willingness to consider such options for the resolution of the issue/s in dispute as may be put forward by another party or through the mediator, or by the mediator in accordance with section 8 (4) of the Act, where requested;</p>
            </AgreementSection>
            
            <AgreementSection title="The Mediator’s role">
                <p>Prior to mediating, the Mediator will make reasonable enquiries to determine if there may be an actual or potential conflict of interest, and he or she will not act, or continue to act, as a mediator where he or she determines that such a conflict exists.</p>
                <p>The Mediator will not act as a legal adviser to any of the parties, nor provide legal advice. The mediator will ensure that all parties are aware of their right to seek independent advice, including legal advice, both during mediation and before signing any mediated agreement (“mediation settlement”).</p>
                <p>The Mediator will complete the mediation as expeditiously as possible, having regard to the nature of the dispute and the need for the parties to have sufficient time to consider the issues.</p>
                <p>The Mediator, where requested to do so by the parties, may make proposals to resolve the issue/s in dispute, but it is for the parties to this mediation to determine whether to accept any such proposals.</p>
                <p>The Mediator is neutral and impartial and will assist the Parties to isolate the issues, develop and explore options for resolution of the issues between them and, if possible, achieve an effective resolution of the issue/s in dispute by agreement between them. The Mediator will not make decisions for a Party or impose a solution on the Parties.</p>
                <p>The mediator will confer with the Parties in relation to designating a venue and a time/s for a Mediation session or sessions; may arrange for the Parties to provide submissions to be exchanged in advance of the first session; will maintain contact with the Parties up to the time of the first Mediation session and subsequently where further sessions are agreed; will read the submissions sent to the Mediator by each Party; and will provide assistance to the Parties in putting together a written settlement agreement ‘ Mediation Settlement’, should an agreement be reached;</p>
                <p>The Parties recognise that they, to the extent that they have not already done so, and without prejudice to the terms of this Agreement which reflect the provisions of the Mediation Act 2017, (“the Act”), should take their own legal advice as to the legal nature of an Agreement to Mediate, the appointment of a Mediator and the rights, duties, responsibilities and powers of a Mediator appointed to assist parties to a mediation, under the terms of the Act. The Parties further recognise that they, to the extent that they have not already done so, should take their own legal advice as to the legal nature of a mediated agreement (“mediation settlement”), and the extent to which same may be agreed by the parties to be an enforceable agreement in accordance with section 11 (1)(b) of the Act.</p>
            </AgreementSection>

            <AgreementSection title="Acknowledgements by the Parties">
                <p>The Parties (and the Mediator) hereby acknowledge and accept and agree that:</p>
                <p className="ml-4">(a) Participation by the Parties in the mediation shall be voluntary at all times and that the Parties, or either, or any, or all of them may withdraw from the mediation at any time but agree that prior to doing so they shall consult with and discuss such proposed departure with the Mediator.</p>
                <p className="ml-4">(b) The fact that proceedings may have been issued in relation to the issue/s in dispute shall not prevent the Parties engaging in mediation at any time prior to the resolution of the dispute.</p>
                <p className="ml-4">(c) A party may-</p>
                <p className="ml-8">(i) withdraw from the mediation at any time during the mediation, and</p>
                <p className="ml-8">(ii) obtain independent advice, including legal advice, at any time during the mediation.</p>
                <p className="ml-4">(d) The Parties and the Mediator, having regard to the nature of the dispute, shall make every reasonable effort to conclude the mediation in an expeditious manner which is likely to minimise costs.</p>
                <p className="ml-4">(e) Subject to the provisions of this Agreement and subject to the confidentiality of the mediation, the Mediator may withdraw from the mediation at any time during the mediation by notice in writing given to the Parties stating the Mediator's general reasons for the withdrawal.</p>
                <p className="ml-4">(f) A withdrawal by the Mediator from the mediation shall not of itself prevent the Mediator from again becoming the mediator in the mediation. Where the Mediator withdraws from the mediation, the Mediator shall return the fees and costs paid in respect of that portion of time during which the Mediator was paid to act as the Mediator and for which he or she will no longer act as the mediator.</p>
                <p className="ml-4">(g) It is for the parties to determine the outcome of the mediation.</p>
                <p className="ml-4">(h) The fees and costs of the mediation shall not be contingent on its outcome.</p>
            </AgreementSection>

            <AgreementSection title="Confidentiality">
                <p>The Parties, their advisors, all persons attending the mediation (to include non-parties) and the Mediator (and any co-mediator), agree that any written summaries of the Parties\' cases, all documents made available to the Mediator or by the Mediator or exchanged by the Parties, any statements whether oral or written made in the course of the mediation by the parties or the mediator and any concessions or admissions of law or fact, shall be entirely and completely confidential in accordance with section 10 of the Act and shall be privileged accordingly, provided that the foregoing shall not prohibit the discovery, inspection or production of documents which, had the mediation not taken place, would otherwise be subject to discovery, inspection or production.</p>
                <p>Evidence introduced into or used in the mediation that is otherwise admissible or subject to discovery in proceedings shall not be or become inadmissible or protected by privilege in such proceedings solely because it was introduced into or used in the mediation.</p>
                <p>All oral submissions, oral statements or oral concessions or admissions of law or fact made in or for the purposes of the Mediation shall be inadmissible as evidence in any legal or similar proceedings whatever.</p>
                <p>The Mediator may hold private sessions or caucus with one party, or one party and their legal adviser. These private sessions are designed to improve the Mediator’s understanding of that party’s position and to facilitate the Mediator in expressing each party’s viewpoint during discussions. Information gained by the Mediator in such a session is confidential unless (a) it is in any event publicly available or, (b) the Mediator(s) is specifically authorised by that party and/or their legal adviser to disclose it. The Mediator will respect the overall confidentiality of the proceedings, except where obliged to do otherwise in accordance with section 10 of the Act. Where such a disclosure is deemed necessary, the Mediator will inform the parties.</p>
                <p>The parties agree not to subpoena or otherwise require the mediator to testify or produce records, notes or any other information or material whatsoever arising out of the mediation in any future alternative dispute resolution or proceedings.</p>
                <p>The Parties agree that they cannot see, inspect or in any way make use of the Mediator\'s notes or any document prepared by him/her for the purposes of or in the course of the Mediation.</p>
                <p>The names of the representatives of the Parties who will be at the mediation will be notified to the Mediator who will notify all parties. The Parties’ or the Parties’ respective representatives at the mediation attend the mediation with full authority to settle the issue/s in dispute.</p>
            </AgreementSection>

            <AgreementSection title="Preservation of right">
                <p>If no written settlement agreement, ‘Mediation Settlement’ is signed by the Parties to settle their dispute, all the Parties\' rights shall be reserved and shall remain in all respects unaffected by the mediation save to the extent provided for in this Agreement. The Parties agree that in such circumstances any documents and written summaries of case furnished to them by the other Party shall be forthwith returned to that Party, and that no copies shall be kept by them. Any documents furnished by the Parties to the Mediator shall, in such circumstances, be returned promptly. The Parties agree that their entering into this agreement shall not prevent any of them from commencing or continuing any litigation or arbitration in relation to the issue/s in dispute.</p>
            </AgreementSection>

            <AgreementSection title="Mediation Process and Termination">
                <p>The Parties agree that the right to determine the procedures during the Mediation is at the rests with the Mediator.</p>
                <p>The Mediation shall continue for the time allotted and shall terminate upon the happening of any of the following events:</p>
                <p className="ml-4">(a) The Parties reach agreement, set out in a mediation settlement, to settle their dispute and such agreement is recorded in writing and signed by both/all Parties;</p>
                <p className="ml-4">(b) One or more of the Parties withdraws from the Mediation;</p>
                <p className="ml-4">(c) The Mediator decides to discontinue the Mediation;</p>
                <p className="ml-4">(d) The Mediator decides for any reason that he/she ought not to continue as Mediator</p>
            </AgreementSection>

            <AgreementSection title="Venue, Fees and Term Details">
                <AgreementTextField control={form.control} name="venueDetails" label="Venue Details" placeholder="Details of venue for mediation sessions" rows={2}/>
                <AgreementTextField control={form.control} name="feeDetails" label="Fee Details" placeholder="Hourly rate or daily rate, include rate charged for services outside of the time spend mediating. Stipulate times that constitute a day, ie. 9 -5 daily rate of xxx." rows={3}/>
                <AgreementTextField control={form.control} name="preMediationFeeDetails" label="Pre-Mediation Fee Details (if applicable)" placeholder="In the event that the Parties settle the Dispute before the Mediation or for any other reason the Mediation does not take place or is adjourned clarify fees payable for pre-mediation services." rows={3}/>
                <p>The Parties agree that the Mediator may book venue and or equipment hire which may be required for the purposes of the Mediation and the Parties agree that they will indemnify the Mediator in respect of any such booking fees, equipment hire or the like which are incurred by the Mediator on their behalf.</p>
                <p>The Parties agree that the Mediator shall not be liable to the Parties in contract, tort (including negligence and/or breach of statutory duty) or otherwise howsoever except for fraud or fraudulent misrepresentation.</p>
            </AgreementSection>
            
            <AgreementSection title="Governing Law">
                <p>This Agreement shall be governed by and construed in accordance with Irish law and the Parties agree to submit to the exclusive jurisdiction of the Courts of Ireland as regards any claim or matter arising under or in relation to this Agreement.</p>
            </AgreementSection>

            <AgreementSection title="Statutes of Limitations">
                 <p>For the purposes of section 18 of the Act the Agreement to Mediate is “signed” on the date that the last party signs this Agreement.</p>
            </AgreementSection>

            <AgreementSection title="Data Retention Policy">
                <AgreementTextField control={form.control} name="dataRetentionPolicyLink" label="Data Retention Policy Details" placeholder="The Mediator’s data retention policy is set out in the policy attached Appendix 1 or is available on the mediator’s website [amend as required]" rows={2}/>
            </AgreementSection>


            <AgreementSection title="Executed as an Agreement by:">
              {renderSignatureBlock("First Party", "firstPartySignatureName", "firstPartySignatureDate")}
              {renderSignatureBlock("Second Party", "secondPartySignatureName", "secondPartySignatureDate")}
              {renderSignatureBlock("Mediator", "mediatorSignatureName", "mediatorSignatureDate")}
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

export default CommercialAgreementBuilder;