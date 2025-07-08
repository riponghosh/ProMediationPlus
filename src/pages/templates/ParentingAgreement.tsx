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
import { Info, FileText, ChevronLeft, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllCaseFileNumbers } from "@/services/localDbService";

// Import PDF generation libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Zod Schema Definition ---
const parentingAgreementSchema = z.object({
    linkedCaseFileNumber: z.string().optional(), // Added for case file number
    // Header
    agreementDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
    childNames: z.string().min(1, "Child(ren)'s name(s) are required."),
    parent1Name: z.string().min(1, "Parent/Guardian 1 name is required."),
    parent2Name: z.string().min(1, "Parent/Guardian 2 name is required."),

    // Main Living Arrangements
    livingArrangementsWeek: z.string().optional().describe("Times and days child(ren) will spend with each parent/guardian."),
    livingArrangementsParent1: z.string().optional().describe("Specific times, activities, responsibilities during Parent 1's time."),
    livingArrangementsParent2: z.string().optional().describe("Specific times, activities, responsibilities during Parent 2's time."),
    livingArrangementsOther: z.string().optional().describe("Other living arrangement details (school, clubs, weekends)."),

    // Communication
    communicationRoutine: z.string().optional().describe("Routine for non-resident parent/guardian to keep contact with child(ren)."),
    communicationFrequency: z.string().optional().describe("How often and when communication will occur."),
    communicationDevices: z.string().optional().describe("Agreed devices for communication."),
    handoverLogistics: z.string().optional().describe("Logistics for child(ren) handover."),
    handoverLocationTime: z.string().optional().describe("Location and time for handovers."),
    handoverContingencyIllness: z.string().optional().describe("Contingency for illness/unavailability during handover."),
    handoverContactUnexpected: z.string().optional().describe("How to contact each other if agreements cannot be followed for unexpected reasons."),

    // Routines
    routinesGeneral: z.string().optional().describe("Details of child(ren)'s existing daily routine and how to continue them."),
    routinesBedtime: z.string().optional().describe("Details for Bedtime."),
    routinesHomeworkActivities: z.string().optional().describe("Details for Homework / extra-curricular activities (clubs)."),
    routinesBehaviour: z.string().optional().describe("Details for Behaviour management."),

    // Holidays
    holidaysGeneral: z.string().optional().describe("How will arrangements be shared between each Parent."),
    holidaysHalfTerms: z.string().optional().describe("Details for School half terms."),
    holidaysFestivals: z.string().optional().describe("Details for Religious festivals."),
    holidaysBirthdaysEvents: z.string().optional().describe("Details for Birthdays / other special events."),
    holidaysOutsideUK: z.string().optional().describe("Holidays outside the UK [Agree on whether this is possible and how to do it]"),

    // Practical Arrangements
    practicalFinancial: z.string().optional().describe("Financial arrangements (child maintenance) [Agree on whether this is needed, who to whom, what amount and how often]"),
    practicalMedical: z.string().optional().describe("Medical care [Address particular needs, approach, medication/doctor routines, surgery decisions etc.]"),
    practicalReligion: z.string().optional().describe("Religion [Decide if/how practiced, education needs, how events spent]"),
    practicalSocialMedia: z.string().optional().describe("Social media [How child's usage regulated? Parent posting rules?]"),
    practicalOtherFactors: z.string().optional().describe("Any other important factors you need to discuss and agree on"),

    // New Partners
    newPartnersIntroduction: z.string().optional().describe("Introduction of New Partners"),

    // Emergency
    emergencyContactPerson: z.string().optional().describe("Emergency Contact Person"),

    // Final Agreements
    agreementReviewDate: z.string().optional().describe("Date to review the agreement."),

    // Signatures
    parent1SignatureName: z.string().optional(),
    parent1SignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
    parent2SignatureName: z.string().optional(),
    parent2SignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
    mediatorSignatureName: z.string().optional(),
    mediatorSignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type ParentingAgreementData = z.infer<typeof parentingAgreementSchema>;

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
    name: keyof ParentingAgreementData;
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
    name: keyof ParentingAgreementData;
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

export function ParentingAgreementBuilder() {
    const isMobile = useIsMobile();
    const [caseFileNumbers, setCaseFileNumbers] = useState<string[]>([]);
    const form = useForm<ParentingAgreementData>({
        resolver: zodResolver(parentingAgreementSchema),
        defaultValues: {
            linkedCaseFileNumber: undefined,
            agreementDate: new Date().toISOString().split('T')[0],
            parent1SignatureDate: new Date().toISOString().split('T')[0],
            parent2SignatureDate: new Date().toISOString().split('T')[0],
            mediatorSignatureDate: new Date().toISOString().split('T')[0],
            // Initialize other fields as empty strings or undefined as appropriate
            childNames: "",
            parent1Name: "",
            parent2Name: "",
            livingArrangementsWeek: "",
            livingArrangementsParent1: "",
            livingArrangementsParent2: "",
            livingArrangementsOther: "",
            communicationRoutine: "",
            communicationFrequency: "",
            communicationDevices: "",
            handoverLogistics: "",
            handoverLocationTime: "",
            handoverContingencyIllness: "",
            handoverContactUnexpected: "",
            routinesGeneral: "",
            routinesBedtime: "",
            routinesHomeworkActivities: "",
            routinesBehaviour: "",
            holidaysGeneral: "",
            holidaysHalfTerms: "",
            holidaysFestivals: "",
            holidaysBirthdaysEvents: "",
            holidaysOutsideUK: "",
            practicalFinancial: "",
            practicalMedical: "",
            practicalReligion: "",
            practicalSocialMedia: "",
            practicalOtherFactors: "",
            newPartnersIntroduction: "",
            emergencyContactPerson: "",
            agreementReviewDate: "",
            parent1SignatureName: "",
            parent2SignatureName: "",
            mediatorSignatureName: "",
        },
    });

    const formRef = React.useRef<HTMLFormElement>(null);

    const watchedParent1Name = form.watch("parent1Name");
    const watchedParent2Name = form.watch("parent2Name");
    const watchedMediatorName = form.watch("mediatorSignatureName"); // Assuming mediator name is set elsewhere or manually entered

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
        if (watchedParent1Name && !form.getValues("parent1SignatureName")) {
            form.setValue("parent1SignatureName", watchedParent1Name, { shouldValidate: false });
        }
    }, [watchedParent1Name, form]);

    React.useEffect(() => {
        if (watchedParent2Name && !form.getValues("parent2SignatureName")) {
            form.setValue("parent2SignatureName", watchedParent2Name, { shouldValidate: false });
        }
    }, [watchedParent2Name, form]);

    React.useEffect(() => {
        if (watchedMediatorName && !form.getValues("mediatorSignatureName")) {
            form.setValue("mediatorSignatureName", watchedMediatorName, { shouldValidate: false });
        }
    }, [watchedMediatorName, form]);

    function onSubmit(data: ParentingAgreementData) {
        console.log("Parenting Agreement Data:", JSON.stringify(data, null, 2));
        toast.success("Parenting Agreement data saved (simulated).");
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

            pdf.save('ParentingAgreement.pdf');
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
                            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Parenting Agreement</h1>
                            <p className="text-muted-foreground text-sm">
                                Create a comprehensive plan for co-parenting arrangements
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

                        {/* Introductory Alert */}
                        <Alert variant="default" className="bg-purple-50 border-purple-200">
                            <Info className="h-4 w-4 text-purple-700" />
                            <AlertTitle className="text-purple-800 font-semibold">Guidance Only</AlertTitle>
                            <AlertDescription className="text-purple-700 space-y-1">
                                <p>This agreement template is for guidance. Discuss each area with the other parent/guardian, prioritizing the child's best interest and well-being.</p>
                                <p>Review and adapt this agreement to your specific needs, as situations change. Seek legal advice or mediation if you have difficulties.</p>
                            </AlertDescription>
                        </Alert>

                        <h1 className="text-2xl font-bold text-center text-purple-800">PARENTING AGREEMENT</h1>

                        {/* Header Info Section */}
                        <AgreementSection title="Agreement Details">
                            <FormField control={form.control} name="childNames" render={({ field }) => ( <FormItem> <FormLabel>For Name(s) of child(ren)</FormLabel> <FormControl><Input placeholder="Child(ren)'s full name(s)" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="agreementDate" render={({ field }) => ( <FormItem> <FormLabel>Agreed on Date</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="parent1Name" render={({ field }) => ( <FormItem> <FormLabel>By Name (Parent/Guardian 1)</FormLabel> <FormControl><Input placeholder="Parent/Guardian 1 Full Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="parent2Name" render={({ field }) => ( <FormItem> <FormLabel>And Name (Parent/Guardian 2)</FormLabel> <FormControl><Input placeholder="Parent/Guardian 2 Full Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        </AgreementSection>

                        {/* Main Sections */}
                        <AgreementSection title="MAIN LIVING ARRANGEMENTS">
                            <AgreementTextField control={form.control} name="livingArrangementsWeek" label="1) During the week, our child(ren) will live with:" description="Set the times and days child(ren) will spend with each parent/guardian." placeholder="e.g., Monday morning to Wednesday evening with Parent 1, Wednesday evening to Friday evening with Parent 2..." rows={4}/>
                            <AgreementTextField control={form.control} name="livingArrangementsParent1" label="a) Parent/Guardian 1 Details" placeholder="Specific times, activities, responsibilities during Parent 1's time..." />
                            <AgreementTextField control={form.control} name="livingArrangementsParent2" label="b) Parent/Guardian 2 Details" placeholder="Specific times, activities, responsibilities during Parent 2's time..." />
                            <AgreementTextField control={form.control} name="livingArrangementsOther" label="Other Living Arrangement Details" description="Agree on who will accompany child(ren) to school, if there any after-school clubs, who will they spend the weekends with and how often etc." placeholder="e.g., School drop-off/pickup schedule, weekend rotation (e.g., alternating weekends), handling of clubs..." rows={4}/>
                        </AgreementSection>

                        <AgreementSection title="COMMUNICATION & HANDOVER">
                            <AgreementTextField control={form.control} name="communicationRoutine" label="2) We will communicate with our child(ren):" description="Set a routine for the non-resident parent/guardian to keep contact with child(ren)." placeholder="e.g., Parent 2 will have calls/video chats..." />
                            <AgreementTextField control={form.control} name="communicationFrequency" label="a) How often and when" placeholder="e.g., Every Tuesday and Thursday evening at 7 PM, Sunday afternoon..." />
                            <AgreementTextField control={form.control} name="communicationDevices" label="b) What devices will be used" placeholder="e.g., Phone calls, video calls (FaceTime, Zoom), text messages..." />
                            <Separator className="my-4" />
                            <AgreementTextField control={form.control} name="handoverLogistics" label="3) Handover Logistics" description="Agree on how child(ren) will be transferred between parents." placeholder="e.g., Parent 1 drops off at Parent 2's home, school pick-up, neutral location..." />
                            <AgreementTextField control={form.control} name="handoverLocationTime" label="a) Location and Time" placeholder="e.g., Every Friday at 5 PM at Parent 2's home..." />
                            <AgreementTextField control={form.control} name="handoverContingencyIllness" label="b) Contingency for Illness/Unavailability" placeholder="e.g., If a parent is ill, the other parent will take over, or a trusted third party will assist..." />
                            <AgreementTextField control={form.control} name="handoverContactUnexpected" label="c) Contact for unexpected reasons" description="How to contact each other if agreements cannot be followed unexpectedly." placeholder="e.g., We must first try direct telephone contact. If unavailable, contact via [Third Party Name/Method]..." />
                        </AgreementSection>

                        <AgreementSection title="ROUTINES">
                             <AgreementTextField control={form.control} name="routinesGeneral" label="General Routine" description="Agree on details of your child(ren)'s existing daily routine and how to continue them across both households." placeholder="Outline the general daily/weekly structure..." />
                             <AgreementTextField control={form.control} name="routinesBedtime" label="1) Bedtime" placeholder="Agreed bedtime routine, times (school nights vs. weekends)..." />
                             <AgreementTextField control={form.control} name="routinesHomeworkActivities" label="2) Homework / extra-curricular activities (clubs)" placeholder="How homework will be managed, transport/attendance for activities..." />
                             <AgreementTextField control={form.control} name="routinesBehaviour" label="3) Behaviour" placeholder="Agreed approach to discipline, rules, rewards..." />
                             <FormDescription>These are basic areas; include details as needed for consistency.</FormDescription>
                        </AgreementSection>

                        <AgreementSection title="HOLIDAYS">
                             <AgreementTextField control={form.control} name="holidaysGeneral" label="General Holiday Arrangements" description="How will arrangements be shared between each Parent?" placeholder="e.g., School holidays will be split equally, alternating major holidays..." />
                             <AgreementTextField control={form.control} name="holidaysHalfTerms" label="1) School half terms" placeholder="Specific division or rotation for half-term breaks..." />
                             <AgreementTextField control={form.control} name="holidaysFestivals" label="2) Religious festivals" placeholder="How religious holidays will be shared or celebrated..." />
                             <AgreementTextField control={form.control} name="holidaysBirthdaysEvents" label="3) Birthdays / other special events" placeholder="Arrangements for child(ren)'s birthdays, family events, etc...." />
                             <AgreementTextField control={form.control} name="holidaysOutsideUK" label="4) Holidays outside the UK" description="Agree on whether this is possible and how to do it." placeholder="Conditions for international travel (e.g., written consent needed, itinerary sharing, passport arrangements)..." />
                        </AgreementSection>

                        <AgreementSection title="PRACTICAL ARRANGEMENTS">
                             <AgreementTextField control={form.control} name="practicalFinancial" label="1) Financial arrangements (child maintenance)" description="Agree on whether this is needed, who to whom, what amount and how often." placeholder="e.g., Parent X will pay Parent Y €Z per month via bank transfer on the 1st..." />
                             <AgreementTextField control={form.control} name="practicalMedical" label="2) Medical care" description="Address particular medical needs, approach, medication/doctor routines, surgery decisions etc." placeholder="How routine check-ups are handled, emergency procedures, decisions on major treatments, managing specific conditions..." rows={5}/>
                             <AgreementTextField control={form.control} name="practicalReligion" label="3) Religion" description="Decide if/how religion will be practiced, education needs, how religious events spent." placeholder="Agreement on religious upbringing, attendance at services/events..." />
                             <AgreementTextField control={form.control} name="practicalSocialMedia" label="4) Social media" description="How child(ren)'s usage regulated? Parent posting rules?" placeholder="Rules for child(ren)'s screen time/accounts, agreement on parents posting photos/info online..." />
                             <AgreementTextField control={form.control} name="practicalOtherFactors" label="5) Any other important factors" placeholder="Include any other specific agreements relevant to your family..." />
                        </AgreementSection>

                         <AgreementSection title="NEW PARTNERS">
                             <AgreementTextField control={form.control} name="newPartnersIntroduction" label="Introduction of New Partners" description="Consider when and how new partners will be introduced in child(ren) life and how they will be involved in their lifestyle following the parenting agreement." placeholder="e.g., Agreement to discuss introduction beforehand, initial meetings in neutral settings, role of new partner..." />
                        </AgreementSection>

                         <AgreementSection title="EMERGENCY">
                             <AgreementTextField control={form.control} name="emergencyContactPerson" label="Emergency Contact Person" description="Decide on another person that can step in when either parent cannot follow through agreements due to unexpected reasons e.g. illness. This can be a grandparent or an adult the child(ren) are familiar with." placeholder="Name and contact details of agreed emergency person(s)..." />
                        </AgreementSection>

                        {/* Final Agreements Section */}
                        <AgreementSection title="AGREEMENTS">
                            <p className="font-medium">We agree on the following principles:</p>
                            <ol className="list-decimal list-outside pl-6 space-y-2">
                                <li>We agree to keep our child(ren)'s well-being and safety as our main priority.</li>
                                <li>We accept that each of us may have different parenting styles which need to be respected.</li>
                                <li>We agree to communicate with each other if we think that the agreement is not suitable.</li>
                                <li>We will resolve the issues by legal advice and mediation before seeking any court orders.</li>
                                <li>
                                    <div className="flex items-center gap-2">
                                        <span>We will review this agreement on</span>
                                        <FormField
                                            control={form.control}
                                            name="agreementReviewDate"
                                            render={({ field }) => (
                                                <FormItem className="inline-block">
                                                    <FormControl>
                                                        <Input type="date" className="w-auto h-8" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                        <span>....</span>
                                    </div>
                                </li>
                            </ol>
                             <FormDescription>These are important principles we advise you to agree on.</FormDescription>
                        </AgreementSection>

                        <Separator className="my-8" />

                        {/* Signature Area */}
                        <AgreementSection title="Signatures">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Parent 1 Signature */}
                                <div className="space-y-2 border p-4 rounded-md text-center">
                                    <FormLabel className="font-semibold">Parent/Guardian 1</FormLabel>
                                    <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"> {/* Signature Line */} </div>
                                    <AgreementInputField control={form.control} name="parent1SignatureName" label="Name (Parent/Guardian 1)" placeholder="Parent/Guardian 1 Printed Name" />
                                    <AgreementInputField control={form.control} name="parent1SignatureDate" label="Date" type="date" />
                                </div>
                                {/* Parent 2 Signature */}
                                <div className="space-y-2 border p-4 rounded-md text-center">
                                    <FormLabel className="font-semibold">Parent/Guardian 2</FormLabel>
                                    <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"> {/* Signature Line */} </div>
                                    <AgreementInputField control={form.control} name="parent2SignatureName" label="Name (Parent/Guardian 2)" placeholder="Parent/Guardian 2 Printed Name" />
                                    <AgreementInputField control={form.control} name="parent2SignatureDate" label="Date" type="date" />
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
                                <FileText className="mr-2 h-5 w-5" /> Save Agreement Data
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