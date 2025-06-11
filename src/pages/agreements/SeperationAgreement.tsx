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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Info, FileText, ChevronLeft, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/layout";

// Import PDF generation libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Zod Schema Definition ---
const separationAgreementSchema = z.object({
    // Preamble/Header
    agreementMadeDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
    mediatorName: z.string().optional(),
    partyAName: z.string().min(1, "Party A's name is required."),
    partyAAddress: z.string().optional(),
    partyBName: z.string().min(1, "Party B's name is required."),
    partyBAddress: z.string().optional(),

    // Background
    mediationAgreedDate: z.string().optional(),
    marriageDate: z.string().optional(),
    marriageLocation: z.string().optional(),
    marriageEndDate: z.string().optional(),
    partyADob: z.string().optional(),
    partyAOccupation: z.string().optional(),
    partyBDob: z.string().optional(),
    partyBOccupation: z.string().optional(),
    numberOfChildren: z.string().optional(),
    childrenDetails: z.string().optional().describe("First names, surnames, DOBs of children of the marriage, and details of any other children."),

    // General Terms
    parentingAgreementAppendixNumber: z.string().optional(),

    // Maintenance/Financial Payments and Support Provisions
    spousalMaintenanceDetails: z.string().optional().describe("Details of spousal maintenance or confirmation that none is sought."),
    childMaintenancePayer: z.string().optional().describe("Party A or Party B"),
    childMaintenanceAmount: z.string().optional().describe("e.g., €500"),
    childMaintenanceFrequency: z.string().optional().describe("e.g., per month, per week"),
    childMaintenancePaymentDateDetails: z.string().optional().describe("e.g., 1st of each month, Friday of each week"),
    childMaintenancePaymentMethodDetails: z.string().optional().describe("e.g., Inter-bank transfer to Party X's account"),
    additionalCostsPercentagePartyA: z.string().optional().describe("e.g., 50%"),
    additionalCostsPercentagePartyB: z.string().optional().describe("e.g., 50%"),
    additionalCostsDetails: z.string().optional().describe("Details of shared additional costs for children."),
    vouchingSystemExpenditureLimit: z.string().optional().describe("e.g., €100"),
    childBenefitAllowanceRecipient: z.string().optional().describe("Party A or Party B, or other arrangement"),
    bankAccountsArrangements: z.string().optional().describe("Arrangements for joint bank accounts; sole accounts remain sole."),
    healthPolicyArrangements: z.string().optional().describe("Arrangements for children's health cover."),
    lifePolicyArrangements: z.string().optional().describe("Agreement on life policy for maintenance liability."),

    // Tax
    singleParentChildCarerTaxCreditArrangement: z.string().optional().describe("Who claims SPCC Tax Credit or alternation details."),

    // Family Home
    familyHomeAddress: z.string().optional(),
    familyHomeFolioReference: z.string().optional(),
    familyHomeMortgageDetails: z.string().optional().describe("Mortgage details or if unencumbered."),
    familyHomeOwnership: z.string().optional().describe("e.g., Sole name of Party A, Both names"),
    familyHomeContentsDistribution: z.string().optional().describe("Reference to Appendix D or prior agreement."),
    familyHomeMarketValue: z.string().optional().describe("e.g., €300,000"),
    familyHomeValuer: z.string().optional().describe("Auctioneer name"),
    familyHomeValuationDate: z.string().optional(),
    familyHomeArrangements: z.string().optional().describe("e.g., Sale, buyout, timeline."),

    // Other Properties
    secondPropertyArrangements: z.string().optional().describe("Agreed arrangements for second property/assets."),
    thirdPropertyArrangements: z.string().optional().describe("Agreed arrangements for third property/assets."),
    fourthPropertyArrangements: z.string().optional().describe("Agreed arrangements for fourth property/assets."),

    // Business Interest / Investments / Shares
    businessInterestsArrangements: z.string().optional().describe("Agreed arrangements for business interests, investments, shares."),

    // Pension Provisions
    pensionPartyADetails: z.string().optional().describe("Party A's name, pension details, policy number. Attach statement as appendix."),
    pensionPartyBDetails: z.string().optional().describe("Party B's name, pension details, policy number. Attach statement as appendix."),

    // Signatures
    partyASignatureName: z.string().optional(),
    partyASignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
    partyBSignatureName: z.string().optional(),
    partyBSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
    mediatorSignatureName: z.string().optional(),
    mediatorSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type SeparationAgreementData = z.infer<typeof separationAgreementSchema>;

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
    name: keyof SeparationAgreementData;
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
    name: keyof SeparationAgreementData;
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


// --- Main Form Component ---
export function SeparationAgreementBuilder() {
    const isMobile = useIsMobile();
    const form = useForm<SeparationAgreementData>({
        resolver: zodResolver(separationAgreementSchema),
        defaultValues: {
            agreementMadeDate: new Date().toISOString().split('T')[0],
            partyAName: "",
            partyAAddress: "",
            partyBName: "",
            partyBAddress: "",
            mediatorName: "",
            mediationAgreedDate: "",
            marriageDate: "",
            marriageLocation: "",
            marriageEndDate: "",
            partyADob: "",
            partyAOccupation: "",
            partyBDob: "",
            partyBOccupation: "",
            numberOfChildren: "",
            childrenDetails: "",
            parentingAgreementAppendixNumber: "",
            spousalMaintenanceDetails: "",
            childMaintenancePayer: "",
            childMaintenanceAmount: "",
            childMaintenanceFrequency: "",
            childMaintenancePaymentDateDetails: "",
            childMaintenancePaymentMethodDetails: "",
            additionalCostsPercentagePartyA: "",
            additionalCostsPercentagePartyB: "",
            additionalCostsDetails: "",
            vouchingSystemExpenditureLimit: "",
            childBenefitAllowanceRecipient: "",
            bankAccountsArrangements: "",
            healthPolicyArrangements: "",
            lifePolicyArrangements: "",
            singleParentChildCarerTaxCreditArrangement: "",
            familyHomeAddress: "",
            familyHomeFolioReference: "",
            familyHomeMortgageDetails: "",
            familyHomeOwnership: "",
            familyHomeContentsDistribution: "",
            familyHomeMarketValue: "",
            familyHomeValuer: "",
            familyHomeValuationDate: "",
            familyHomeArrangements: "",
            secondPropertyArrangements: "",
            thirdPropertyArrangements: "",
            fourthPropertyArrangements: "",
            businessInterestsArrangements: "",
            pensionPartyADetails: "",
            pensionPartyBDetails: "",
            partyASignatureName: "",
            partyASignatureDate: new Date().toISOString().split('T')[0],
            partyBSignatureName: "",
            partyBSignatureDate: new Date().toISOString().split('T')[0],
            mediatorSignatureName: "",
            mediatorSignatureDate: new Date().toISOString().split('T')[0],
        },
    });

    const formRef = React.useRef<HTMLFormElement>(null); // Ref for the form element

    const watchedPartyAName = form.watch("partyAName");
    const watchedPartyBName = form.watch("partyBName");
    const watchedMediatorName = form.watch("mediatorName");

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

    function onSubmit(data: SeparationAgreementData) {
        console.log("Separation Agreement Data:", JSON.stringify(data, null, 2));
        toast.success("Separation Agreement data saved (simulated).");
        // TODO: Send data to backend, generate document, etc.
    }

    const handleDownloadPdf = async () => {
        const formElement = formRef.current;
        if (!formElement) {
            toast.error("Form element not found. Cannot generate PDF.");
            return;
        }

        toast.info("Generating PDF, please wait...", { duration: 5000 });

        // Temporarily hide buttons to prevent them from appearing in the PDF
        const downloadButton = document.getElementById("download-pdf-button");
        const saveButton = document.getElementById("save-agreement-button");
        
        const originalDownloadDisplay = downloadButton ? downloadButton.style.display : '';
        const originalSaveDisplay = saveButton ? saveButton.style.display : '';

        if (downloadButton) downloadButton.style.display = 'none';
        if (saveButton) saveButton.style.display = 'none';

        try {
            const canvas = await html2canvas(formElement, {
                scale: 2, // Improves quality
                useCORS: true, // If you have external images/resources
                logging: false, // Set to true for debugging, false for production
                windowWidth: formElement.scrollWidth, // Capture full width of the content
                windowHeight: formElement.scrollHeight, // Capture full scrollable height of the content
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p', // portrait
                unit: 'mm',       // millimeters
                format: 'a4',     // A4 paper size
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const pageMargin = 10; // 10mm margin on each side

            // Calculate the width and height of the image in the PDF, maintaining aspect ratio
            // Fit image to width, considering margins
            const availableWidth = pdfWidth - (2 * pageMargin);
            const imgRenderWidth = availableWidth;
            const imgRenderHeight = (imgProps.height * imgRenderWidth) / imgProps.width;

            let heightLeft = imgRenderHeight;
            let position = 0; // Y-position of the image slice on the current PDF page

            // Add the first page
            pdf.addImage(imgData, 'PNG', pageMargin, pageMargin + position, imgRenderWidth, imgRenderHeight);
            heightLeft -= (pdfHeight - (2 * pageMargin));

            // Add more pages if the image is taller than one page
            while (heightLeft > 0) {
                position -= (pdfHeight - (2 * pageMargin)); // Adjust position for the next slice
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', pageMargin, pageMargin + position, imgRenderWidth, imgRenderHeight);
                heightLeft -= (pdfHeight - (2 * pageMargin));
            }

            pdf.save('SeparationAgreement.pdf');
            toast.success("PDF downloaded successfully!");

        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF. See console for details.");
        } finally {
            // Restore button visibility
            if (downloadButton) downloadButton.style.display = originalDownloadDisplay;
            if (saveButton) saveButton.style.display = originalSaveDisplay;
        }
    };


    const renderStaticTextSection = (title: string, content: React.ReactNode) => (
        <AgreementSection title={title}>
            <div className="space-y-3 text-sm text-gray-700">{content}</div>
        </AgreementSection>
    );

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
                            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Separation Agreement Builder</h1>
                            <p className="text-muted-foreground text-sm">
                                Create a Separation Agreement intended to be legally binding.
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef} className="space-y-8 p-1 md:p-2 max-w-5xl mx-auto">

                        <Alert variant="default" className="bg-purple-50 border-purple-200">
                            <Info className="h-4 w-4 text-purple-700" />
                            <AlertTitle className="text-purple-800 font-semibold">Guidance & Template</AlertTitle>
                            <AlertDescription className="text-purple-700 space-y-1">
                                <p>This form helps you structure a Separation Agreement based on a template. Fill in the details as accurately as possible.</p>
                                <p>It is strongly advised that both parties seek independent legal advice before signing any agreement. This template is for guidance and may need adaptation to specific circumstances.</p>
                            </AlertDescription>
                        </Alert>

                        <h1 className="text-2xl font-bold text-center text-purple-800">SEPARATION AGREEMENT</h1>
                        <p className="text-sm text-center text-muted-foreground">(A template for a Mediated Settlement, A Separation Agreement intended to be legally binding between the parties, who are married.)</p>

                        <AgreementSection title="Preamble">
                            <AgreementInputField control={form.control} name="agreementMadeDate" label="Agreement Made Date" type="date" description="This MEDIATION SETTLEMENT, A Separation Agreement made the day of" />
                            <AgreementInputField control={form.control} name="mediatorName" label="Mediator(s) Name" placeholder="Name of mediator/s" description="...in accordance with the provisions of the Mediation Act 2017, and agreed with the assistance of" />
                            <Separator className="my-4" />
                            <p className="font-medium text-center">Between;</p>
                            <AgreementInputField control={form.control} name="partyAName" label="Party A Name" placeholder="Full Name of Party A" />
                            <AgreementInputField control={form.control} name="partyAAddress" label="Party A Address" placeholder="Address of Party A" />
                            <p className="font-medium text-center">AND</p>
                            <AgreementInputField control={form.control} name="partyBName" label="Party B Name" placeholder="Full Name of Party B" />
                            <AgreementInputField control={form.control} name="partyBAddress" label="Party B Address" placeholder="Address of Party B" />
                        </AgreementSection>

                        <AgreementSection title="Background">
                            <AgreementInputField control={form.control} name="mediationAgreedDate" label="Mediation Agreed Date" type="date" description="The parties first agreed to Meditate on" />
                            <AgreementInputField control={form.control} name="marriageDate" label="Marriage Date" type="date" />
                            <AgreementInputField control={form.control} name="marriageLocation" label="Marriage Location" placeholder="Location of marriage" />
                            <FormDescription>Marriage certificate to be attached as Appendix (A).</FormDescription>
                            <AgreementInputField control={form.control} name="marriageEndDate" label="Marriage End Date" type="date" description="Date the marriage ended / parties began to live separate and apart." />
                            <Separator className="my-4" />
                            <AgreementInputField control={form.control} name="partyADob" label="Party A Date of Birth" type="date" />
                            <AgreementInputField control={form.control} name="partyAOccupation" label="Party A Occupation" placeholder="Occupation of Party A" />
                            <AgreementInputField control={form.control} name="partyBDob" label="Party B Date of Birth" type="date" />
                            <AgreementInputField control={form.control} name="partyBOccupation" label="Party B Occupation" placeholder="Occupation of Party B" />
                            <Separator className="my-4" />
                            <AgreementInputField control={form.control} name="numberOfChildren" label="Number of Children of the Marriage" placeholder="e.g., Two, 2" />
                            <AgreementTextField control={form.control} name="childrenDetails" label="Children's Details" placeholder="First names, surnames, DOBs of children of the marriage. Include details of any other children either party may have with a third party." rows={4} />
                            <Separator className="my-4" />
                            <div className="space-y-2 text-sm text-gray-700">
                                <p>The parties have agreed that there is no possibility of reconciliation and agree to live apart from each other in accordance with the terms set out in this agreement.</p>
                                <p>The parties agree, in accordance with section 11(1) (b) of the Mediation Act 2017, that they intend these mediated terms to be legally binding upon each of them. The parties also acknowledge that in accordance with section 8(2) (d) of the Act that they have been advised by the mediator to seek legal advice during mediation and before signing this Agreement, and each confirm that they have done so, and hereby covenant and agree with each other as follows:</p>
                            </div>
                        </AgreementSection>

                        {renderStaticTextSection("General Terms - Living Arrangements", (
                            <>
                                <p>The parties agree to live separate and apart from and free from the marital control of the other and each party agrees not to interfere with the other in their manner of living or in their profession or business, to the intent that each may live going forward as if they were sole and unmarried.</p>
                                <p>It is agreed that neither party will visit or be or stay in any place in which the other is for the time being, resident save by invitation as soon as the terms of the agreement allow.</p>
                                <p>It is agreed that the parties will continue to be joint guardians and custodians of the child/children of the marriage while they are under the age of 18 years. [State child or children as appropriate in final document]</p>
                            </>
                        ))}

                        <AgreementSection title="General Terms - Parenting">
                            <AgreementInputField control={form.control} name="parentingAgreementAppendixNumber" label="Parenting Agreement Appendix Number" placeholder="e.g., B" description="Both parties agree to carry out the parenting arrangements agreed set out in the Parenting Agreement, attached, Appendix (...)" />
                             <div className="space-y-2 text-sm text-gray-700 mt-2">
                                <p>...and any subsequent amendments to that agreement that they may agree from time to time. Whereby the parents do not agree on changes to the parenting agreement they agree to first return to mediation prior to taking any court proceedings.</p>
                                <p>The parties agree that they will to the greatest possible extent consult with each other on all matters effecting their children’s education, training, career prospects, medical care and treatment; and general health, well-being and welfare. They each agree to notify the other party immediately if any of the child/children become seriously ill; and, in particular, if any of them should be admitted to hospital. [Amend as required in final document]</p>
                                <p>The parties each agree that at all times they will each support the relationship of the children with both parents.</p>
                            </div>
                        </AgreementSection>

                        <AgreementSection title="Maintenance/Financial Payments and Support Provisions">
                            <p className="font-medium">The parties agree the following financial arrangements for the foreseeable future:</p>
                            <AgreementTextField control={form.control} name="spousalMaintenanceDetails" label="Spousal Maintenance" placeholder="Detail spousal maintenance OR state that neither party is seeking it." description="Example: The parties agree that their present circumstances are such that neither requires maintenance from the other and neither envisages a change in circumstances in the future whereby maintenance would become payable." rows={4}/>
                            <Separator className="my-4" />
                            <p className="font-medium">Child Maintenance:</p>
                            <AgreementInputField control={form.control} name="childMaintenancePayer" label="Paying Party for Child Maintenance" placeholder="Party A or Party B" />
                            <AgreementInputField control={form.control} name="childMaintenanceAmount" label="Child Maintenance Amount per Child" placeholder="e.g., €500" />
                            <AgreementInputField control={form.control} name="childMaintenanceFrequency" label="Child Maintenance Frequency" placeholder="e.g., per month, per week" />
                            <FormDescription>For each dependent child, where that child lives with the other Party, and reaches the age of 23, or until they reach the age of 18 if they are no longer in full-time education.</FormDescription>
                            <AgreementInputField control={form.control} name="childMaintenancePaymentDateDetails" label="Child Maintenance Payment Date" placeholder="e.g., 1st of each month OR Friday of each week" />
                            <AgreementTextField control={form.control} name="childMaintenancePaymentMethodDetails" label="Child Maintenance Payment Method" placeholder="e.g., By inter-bank transfer, into the account of Party [X]" />
                            <FormDescription>It is further agreed that should the financial circumstances of either party fundamentally change; that the person who is paying child maintenance may seek to revise their contribution downwards, until such time as their financial circumstances improve, and equally the person receiving child maintenance may seek an increase in maintenance for the children. Both parties agree to first return to mediation to try and agree any change that is required.</FormDescription>
                            <Separator className="my-4" />
                            <p className="font-medium">Additional Child Costs:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AgreementInputField control={form.control} name="additionalCostsPercentagePartyA" label="Party A's Share of Additional Costs" placeholder="e.g., 50%" />
                                <AgreementInputField control={form.control} name="additionalCostsPercentagePartyB" label="Party B's Share of Additional Costs" placeholder="e.g., 50%" />
                            </div>
                            <AgreementTextField control={form.control} name="additionalCostsDetails" label="Details of Additional Costs" placeholder="e.g., Back to school, third level education, medical/orthodontic not covered by insurance, sports clothing, extra-curricular activities, school trips." rows={4}/>
                            <FormDescription>The parties each agree to a vouching system for additional costs. Each party will provide receipts for any agreed reasonable costs incurred and reimburse the other party within two weeks of vouching.</FormDescription>
                            <AgreementInputField control={form.control} name="vouchingSystemExpenditureLimit" label="Expenditure Limit for Prior Consent" placeholder="e.g., €100" description="Where any expenditure is likely to be over this amount, each party agrees that they will first seek the express consent of the other party, before incurring that cost." />
                            <Separator className="my-4" />
                            <AgreementInputField control={form.control} name="childBenefitAllowanceRecipient" label="Recipient of Child Benefit Allowance" placeholder="Party A or Party B" />
                            <AgreementTextField control={form.control} name="bankAccountsArrangements" label="Bank Accounts and Policies" placeholder="Arrangements for any joint bank accounts. Sole accounts remain sole. Details in Statements of Means (Appendix C)." rows={3}/>
                            <AgreementTextField control={form.control} name="healthPolicyArrangements" label="Health Policy Arrangements" placeholder="Arrangements for health cover for the child/ren, if relevant." rows={3}/>
                            <AgreementTextField control={form.control} name="lifePolicyArrangements" label="Life Policy Arrangements" placeholder="Agreement on life policy to cover maintenance liability." rows={3}/>
                        </AgreementSection>

                        <AgreementSection title="Tax">
                             <div className="space-y-2 text-sm text-gray-700">
                                <p>The parties agree that they will be separately assessed for income tax pursuant to Section 3 of the Finance Act 1983 and shall be treated as single persons for the future for all tax purposes.</p>
                            </div>
                            <AgreementTextField control={form.control} name="singleParentChildCarerTaxCreditArrangement" label="Single Parent Child Carer’s Tax Credit (SPCC)" placeholder="Detail who claims the SPCC tax credit or if it's alternated." description="e.g., Claimed by party in receipt of child benefit, or assigned if not working, or alternated yearly if both eligible." rows={4}/>
                        </AgreementSection>

                        <AgreementSection title="Family Home">
                            <AgreementInputField control={form.control} name="familyHomeAddress" label="Family Home Address" placeholder="Full address of the family home" />
                            <AgreementInputField control={form.control} name="familyHomeFolioReference" label="Family Home Folio Reference (if applicable)" placeholder="Folio reference" />
                            <AgreementTextField control={form.control} name="familyHomeMortgageDetails" label="Family Home Mortgage Details" placeholder="Mortgage details or state if unencumbered." rows={3}/>
                            <AgreementInputField control={form.control} name="familyHomeOwnership" label="Family Home Ownership" placeholder="e.g., Sole name of Party A, Registered in both names" />
                            <AgreementTextField control={form.control} name="familyHomeContentsDistribution" label="Distribution of Family Home Contents" placeholder="As set out in Appendix (D) or as agreed prior to mediation." rows={3}/>
                            <AgreementInputField control={form.control} name="familyHomeMarketValue" label="Family Home Market Value" placeholder="e.g., €300,000" />
                            <AgreementInputField control={form.control} name="familyHomeValuer" label="Valuer (Auctioneer)" placeholder="Name of Auctioneer" />
                            <AgreementInputField control={form.control} name="familyHomeValuationDate" label="Valuation Date" type="date" />
                            <FormDescription>Valuation report to be Appendix (E).</FormDescription>
                            <AgreementTextField control={form.control} name="familyHomeArrangements" label="Agreed Arrangements for Family Home" placeholder="e.g., To be sold, one party buying out the other, timeline." rows={4}/>
                        </AgreementSection>

                        <AgreementSection title="Other Properties / Assets">
                            <AgreementTextField control={form.control} name="secondPropertyArrangements" label="Second Property / Assets" placeholder="Agreed arrangements for any second property or assets (e.g., savings, shares)." rows={3}/>
                            <AgreementTextField control={form.control} name="thirdPropertyArrangements" label="Third Property / Assets" placeholder="Agreed arrangements for any third property or assets." rows={3}/>
                            <AgreementTextField control={form.control} name="fourthPropertyArrangements" label="Fourth Property / Assets" placeholder="Agreed arrangements for any fourth property or assets." rows={3}/>
                        </AgreementSection>

                        <AgreementSection title="Business Interest / Investments / Shares">
                            <AgreementTextField control={form.control} name="businessInterestsArrangements" label="Business Interests / Investments / Shares" placeholder="Agreed arrangements for business(es) owned by either party, or other investments/shares." rows={4}/>
                        </AgreementSection>

                        {renderStaticTextSection("Waiver", (
                            <>
                                <p>The parties acknowledge that any house or premises which might subsequently be purchased by either of them at any time in the future are not to be held to be a “family home” and further to the extent that same is required, consents for the purposes of Section 3 of the Family Home Protection Act 1976, to the sale (or other disposal) by either of them at any time hereafter, at their absolute discretion without any notice to the other, of any property which either might own at any time in the future, and acknowledge that this Agreement shall constitute written consent such as may be required by the Family Home Protection Act 1976 to any such sale.</p>
                                <p>The parties mutually acknowledge and agree that apart from their mutual rights and obligations under this agreement that neither of them will have any right, claim or entitlement whatsoever in, over or in respect of any present or future property, monies or assets of the other of them whether pursuant to the provisions of the Constitution, the Judicial Separation & Family Law Reform Act 1989, or the Family Law Act 1995 or any other similar statutory provision or pursuant to common law, equity or otherwise.</p>
                            </>
                        ))}

                        {renderStaticTextSection("Responsibility for Debts", (
                            <p>The parties hereby agree that going forward they will at all times keep each other indemnified from and against all debts and liabilities incurred by them personally, in the course of their business, and any other personal debts, or any debts contracted after this agreement is signed. The parties agree to indemnify each other from and all liability whatsoever in respect of any new debts, and from and against all actions, costs, proceedings, claims, damages, demands, losses and expenses in respect of or on account of any such debts or liabilities, and each agree that they will not in any manner pledge the other's credit.</p>
                        ))}

                        {renderStaticTextSection("Succession Act Rights", (
                            <p>The parties hereby mutually surrender and renounce all rights either of them may have under the Succession Act 1965 to any share or legal right in the estate of the other on the other's death either testate or intestate, and hereby renounce and waive their respective rights to the extraction of a Grant of Probate or Administration in the estate of the other and undertake not to interfere in any way with the extraction of a Grant of Probate or Administration in the estate of the other provided that none of the above will impede either of them from taking any legal action on behalf of the child/ren to protect or defend the children's interests in the estate of either party or from taking any action on behalf of the children under the provisions of the Succession Act 1965.</p>
                        ))}

                        <AgreementSection title="Pension Provisions">
                            <FormDescription>Pension orders can only be made by a judge. If parties enter into a Separation Agreement, they cannot get pension adjustment orders until divorce. Include details if parties agree not to seek pension adjustment orders or if neither holds a pension.</FormDescription>
                            <p className="font-medium mt-2">Example (if no claim on other's pension):</p>
                            <p className="text-sm text-gray-700">Both parties agree the following in relation to their pensions. Neither party will have claim over any pension of the other now or at any time in the future.</p>
                            <AgreementTextField control={form.control} name="pensionPartyADetails" label="Party A Pension Details" placeholder="Party A's name, pension details, policy number. Attach statement as appendix." rows={3}/>
                            <AgreementTextField control={form.control} name="pensionPartyBDetails" label="Party B Pension Details" placeholder="Party B's name, pension details, policy number. Attach statement as appendix." rows={3}/>
                        </AgreementSection>

                        {renderStaticTextSection("Miscellaneous Provisions", (
                             <>
                                <p>For the purpose of the law of Nullity the parties hereby agree that this agreement shall not be regarded as an approbation or a ratification of a void or voidable marriage.</p>
                                <p>The parties hereby agree for all the purposes and in particular for the purposes of any proceedings brought by either of them for divorce that it is their intention that this agreement is in full and final settlement of all present and future property and financial claims (save for periodic maintenance) which either of them may have against the other under the Constitution of Ireland and the Family Law (Maintenance of Spouse’s and Children) Act, 1976, the Judicial Separation & Family Law Reform Act, 1989, The Family Law Act, 1995, The Family Law (Divorce) Act, 1996 or under any Act of the Oireachtas amending these Acts or under the provisions of any other similar legislation of this or any jurisdiction, under the Rules of the Equity, the Common Law or otherwise. The parties hereto agree not to issue or maintain proceedings under the legislative provisions mentioned in this clause, save in respect of periodic maintenance and save to obtain a Decree of Divorce, mutual blocking orders under Section 18(10)of the Family Law (Divorce)Act 1996, Orders under section 17 as provided for in clause 33, and declarations pursuant to Section 15(1) (b) that each party is the sole owner of their respective assets and pensions.</p>
                                <p>The parties acknowledge and confirm that they have been respectively independently advised by their solicitors of the meaning and effects of the provisions of Section 27 of the Family Law (Maintenance of Spouses and Children) Act 1976, the Family Law Divorce Act 1995 and the Judicial Separation & Family Law Reform Act 1989 and the Marriage Act 2015 and notwithstanding the provisions thereof each of them hereby acknowledges, declares and confirms that it is their solemn and considered belief and intention that the provisions of this agreement shall operate and be regarded by both of them as a full and final settlement and resolution of all their respective rights, entitlements, obligations and liabilities over and in respect of the other of them and that they hereby acknowledge and declare for all purposes and in particular for the purposes of any proceedings brought by either of them for divorce.</p>
                                <p>The parties agree that this agreement has been reached on the basis of full disclosure of all their respective material assets and sources of income; sworn affidavits of both parties being listed in Appendix (insert appropriate appendix letter here) attached hereto.</p>
                                <p>In this agreement wherever reference is made to an Act of Oireachtas, such reference shall include reference to any Act of the Oireachtas amending, modifying, replacing or re-enacting any such Act or Acts.</p>
                                <p>In the event that the parties are unable to resolve any problems arising in relation to this agreement, they agree to first seek to resolve any such difficulties in mediation, contacting the mediator [Mediator's Name from Preamble, or specific name like Michelle Browne], or if that mediator is unavailable another appropriately qualified mediator with a view to resolving the issue, unless immediate injunctive relief is appropriate and required in the circumstances.</p>
                            </>
                        ))}
                        
                        <div className="text-center space-y-2 text-sm text-gray-700 mt-6">
                            <p>This MEDIATED AGREEMENT shall be governed by the laws of Ireland, giving our consent and pledge to abide by this agreement at all times henceforth.</p>
                            <p>IN WITNESS whereof the parties hereto have hereunder set their hands and affixed their Seals this day and year first herein WRITTEN.</p>
                        </div>

                        <AgreementSection title="Signatures">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Party A Signature */}
                                <div className="space-y-2 border p-4 rounded-md text-center">
                                    <FormLabel className="font-semibold">Party A</FormLabel>
                                    <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"> {/* Signature Line */} </div>
                                    <AgreementInputField control={form.control} name="partyASignatureName" label="Name (Party A)" placeholder="Party A Printed Name" />
                                    <AgreementInputField control={form.control} name="partyASignatureDate" label="Date" type="date" />
                                </div>
                                {/* Party B Signature */}
                                <div className="space-y-2 border p-4 rounded-md text-center">
                                    <FormLabel className="font-semibold">Party B</FormLabel>
                                    <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"> {/* Signature Line */} </div>
                                    <AgreementInputField control={form.control} name="partyBSignatureName" label="Name (Party B)" placeholder="Party B Printed Name" />
                                    <AgreementInputField control={form.control} name="partyBSignatureDate" label="Date" type="date" />
                                </div>
                                {/* Mediator Signature */}
                                <div className="space-y-2 border p-4 rounded-md text-center">
                                    <FormLabel className="font-semibold">Mediator</FormLabel>
                                    <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"> {/* Signature Line */} </div>
                                    <AgreementInputField control={form.control} name="mediatorSignatureName" label="Name (Mediator)" placeholder="Mediator Printed Name" />
                                    <AgreementInputField control={form.control} name="mediatorSignatureDate" label="Date" type="date" />
                                    <FormDescription className="text-xs">Signed by the mediator in accordance with section 2(1)(o) Mediation Act 2017</FormDescription>
                                </div>
                            </div>
                        </AgreementSection>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
                            <Button type="submit" size="lg" id="save-agreement-button">
                                <FileText className="mr-2 h-5 w-5" /> Save Separation Agreement Data
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