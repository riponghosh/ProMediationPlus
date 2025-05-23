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
import { Info, FileText, ChevronLeft } from "lucide-react"; // Added icons
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/layout";

// --- Zod Schema Definition ---

const parentingAgreementSchema = z.object({
    // Header Info
    childNames: z.string().min(1, "Child(ren)'s name(s) are required."),
    agreementDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" })
        .default(new Date().toISOString().split('T')[0]), // Use string for date input
    parent1Name: z.string().min(1, "Parent/Guardian 1 name is required."),
    parent2Name: z.string().min(1, "Parent/Guardian 2 name is required."),

    // Main Living Arrangements (Section 1)
    livingArrangementsWeek: z.string().optional().describe("Set the times and days child(ren) will spend with each parent/guardian"),
    livingArrangementsParent1: z.string().optional().describe("Details for Parent/Guardian 1"),
    livingArrangementsParent2: z.string().optional().describe("Details for Parent/Guardian 2"),
    livingArrangementsOther: z.string().optional().describe("School accompaniment, after-school clubs, weekends, frequency etc."),

    // Child Communication (Section 2)
    communicationRoutine: z.string().optional().describe("Set a routine for other parent/guardian to keep contact with child(ren)"),
    communicationFrequency: z.string().optional().describe("How often and when"),
    communicationDevices: z.string().optional().describe("Through which devices [telephone call, video call – Skype etc]"),

    // Handover (Section 1)
    handoverLogistics: z.string().optional().describe("Agree on how and where child(ren) will be picked up by the other Parent/guardian"),
    handoverLocationTime: z.string().optional().describe("Location / time for handover"),
    handoverContingencyIllness: z.string().optional().describe("If Parent/guardian is ill or unable to look after child(ren) we will... [mention third person, e.g., grandparents]"),
    handoverContactUnexpected: z.string().optional().describe("We must first try to contact each other if these agreements cannot be followed for unexpected reasons [state how - telephone, third party]"),

    // Routines
    routinesGeneral: z.string().optional().describe("Agree on details of your child(ren)'s existing daily routine and how to continue them"),
    routinesBedtime: z.string().optional().describe("Details for Bedtime"),
    routinesHomeworkActivities: z.string().optional().describe("Details for Homework / extra-curricular activities (clubs)"),
    routinesBehaviour: z.string().optional().describe("Details for Behaviour management"),

    // Holidays
    holidaysGeneral: z.string().optional().describe("How will arrangements be shared between each Parent"),
    holidaysHalfTerms: z.string().optional().describe("Details for School half terms"),
    holidaysFestivals: z.string().optional().describe("Details for Religious festivals"),
    holidaysBirthdaysEvents: z.string().optional().describe("Details for Birthdays / other special events"),
    holidaysOutsideUK: z.string().optional().describe("Holidays outside the UK [Agree on whether this is possible and how to do it]"),

    // Practical Arrangements
    practicalFinancial: z.string().optional().describe("Financial arrangements (child maintenance) [Agree on whether this is needed, who to whom, what amount and how often]"),
    practicalMedical: z.string().optional().describe("Medical care [Address particular needs, approach, medication/doctor routines, surgery decisions etc.]"),
    practicalReligion: z.string().optional().describe("Religion [Decide if/how practiced, education needs, how events spent]"),
    practicalSocialMedia: z.string().optional().describe("Social media [How child's usage regulated? Parent posting rules?]"),
    practicalOtherFactors: z.string().optional().describe("Any other important factors you need to discuss and agree on"),

    // New Partners
    newPartnersIntroduction: z.string().optional().describe("Consider when and how new partners will be introduced in child(ren) life and how they will be involved"),

    // Emergency
    emergencyContactPerson: z.string().optional().describe("Decide on another person that can step in when either parent cannot follow through agreements due to unexpected reasons e.g. illness. [grandparent or familiar adult]"),

    // Final Agreement Principles (Only review date is a field)
    agreementReviewDate: z.string().optional().describe("We will review this agreement on ...."), // Optional date string

    // Signature Info (Capture printed name and date)
    parent1SignatureName: z.string().optional(),
    parent1SignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
    parent2SignatureName: z.string().optional(),
    parent2SignatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type ParentingAgreementData = z.infer<typeof parentingAgreementSchema>;

// --- Helper Component for Sections ---
interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const AgreementSection: React.FC<SectionProps> = ({ title, children }) => (
    <div className="space-y-4 p-4 md:p-6 border rounded-lg bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// --- Helper Component for Text Fields ---
interface AgreementTextFieldProps {
    control: any;
    name: keyof ParentingAgreementData; // Ensure name is a valid key
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
    const form = useForm<ParentingAgreementData>({
        resolver: zodResolver(parentingAgreementSchema),
        defaultValues: {
            agreementDate: new Date().toISOString().split('T')[0],
            parent1SignatureDate: new Date().toISOString().split('T')[0],
            parent2SignatureDate: new Date().toISOString().split('T')[0],
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
        },
    });

    // Pre-fill signature names based on header names
    const watchedParent1Name = form.watch("parent1Name");
    const watchedParent2Name = form.watch("parent2Name");

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

    function onSubmit(data: ParentingAgreementData) {
        console.log("Separation Agreement Data:", JSON.stringify(data, null, 2));
        toast.success("Separation Agreement saved (simulated).");
        // TODO: Send data to backend, generate document, etc.
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
                            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Separation Agreement</h1>
                            <p className="text-muted-foreground text-sm">
                                Create a legal agreement outlining terms for separated couples
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">

                        {/* Introductory Alert */}
                        <Alert variant="default" className="bg-purple-50 border-purple-200">
                            <Info className="h-4 w-4 text-purple-700" />
                            <AlertTitle className="text-purple-800 font-semibold">Guidance Only</AlertTitle>
                            <AlertDescription className="text-purple-700 space-y-1">
                                <p>This separation agreement template is for guidance. Discuss each area with your former partner, prioritizing legal clarity and mutual benefit.</p>
                                <p>Review and adapt this agreement to your specific needs, as situations change. Seek legal advice or mediation if you have difficulties.</p>
                            </AlertDescription>
                        </Alert>

                        <h1 className="text-2xl font-bold text-center text-purple-800">SEPARATION AGREEMENT</h1>

                        {/* Header Info Section */}
                        <div className="space-y-4 p-4 border rounded-md">
                            <FormField control={form.control} name="childNames" render={({ field }) => ( <FormItem> <FormLabel>For Name(s) of child(ren)</FormLabel> <FormControl><Input placeholder="Child(ren)'s full name(s)" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="agreementDate" render={({ field }) => ( <FormItem> <FormLabel>Agreed on Date</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="parent1Name" render={({ field }) => ( <FormItem> <FormLabel>By Name (Parent/Guardian 1)</FormLabel> <FormControl><Input placeholder="Parent/Guardian 1 Full Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="parent2Name" render={({ field }) => ( <FormItem> <FormLabel>And Name (Parent/Guardian 2)</FormLabel> <FormControl><Input placeholder="Parent/Guardian 2 Full Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        </div>

                        {/* Main Sections */}
                        <AgreementSection title="MAIN LIVING ARRANGEMENTS">
                            <AgreementTextField control={form.control} name="livingArrangementsWeek" label="1) During the week, our child(ren) will live with:" description="Set the times and days child(ren) will spend with each parent/guardian." placeholder="e.g., Monday morning to Wednesday evening with Parent 1, Wednesday evening to Friday evening with Parent 2..." rows={4}/>
                            <AgreementTextField control={form.control} name="livingArrangementsParent1" label="a) Parent/Guardian 1 Details" placeholder="Specific times, activities, responsibilities during Parent 1's time..." />
                            <AgreementTextField control={form.control} name="livingArrangementsParent2" label="b) Parent/Guardian 2 Details" placeholder="Specific times, activities, responsibilities during Parent 2's time..." />
                            <AgreementTextField control={form.control} name="livingArrangementsOther" label="Other Living Arrangement Details" description="Agree on who will accompany child(ren) to school, if there any after-school clubs, who will they spend the weekends with and how often etc." placeholder="e.g., School drop-off/pickup schedule, weekend rotation (e.g., alternating weekends), handling of clubs..." rows={4}/>

                            <Separator className="my-4" />

                            <AgreementTextField control={form.control} name="communicationRoutine" label="2) We will communicate with our child(ren):" description="Set a routine for the non-resident parent/guardian to keep contact with child(ren)." placeholder="e.g., Parent 2 will have calls/video chats..." />
                            <AgreementTextField control={form.control} name="communicationFrequency" label="a) How often and when" placeholder="e.g., Every Tuesday and Thursday evening at 7 PM, Sunday afternoon..." />
                            <AgreementTextField control={form.control} name="communicationDevices" label="b) Through which devices" placeholder="e.g., Telephone call, video call (Skype, FaceTime, WhatsApp)..." />
                        </AgreementSection>

                        <AgreementSection title="HANDOVER">
                             <AgreementTextField control={form.control} name="handoverLogistics" label="1) Our child(ren) will go from one parent/guardian to the other:" description="Agree on how and where child(ren) will be picked up by the other Parent/guardian." placeholder="e.g., Pickups will occur at school on Fridays, drop-offs at Parent X's home on Sundays..." />
                             <AgreementTextField control={form.control} name="handoverLocationTime" label="a) Location / time for handover" placeholder="Specific location (e.g., school gate, parent's doorstep, neutral location) and time (e.g., 3:30 PM Fridays, 6:00 PM Sundays)..." />
                             <AgreementTextField control={form.control} name="handoverContingencyIllness" label="b) If Parent/guardian is ill or unable" description="Plan for when a parent is ill or unable to care for the child(ren)." placeholder="e.g., We will notify the other parent immediately. [Grandparent Name] is available as a backup caregiver upon mutual agreement..." />
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
                             <AgreementTextField control={form.control} name="holidaysFestivals" label="2) Religious festivals" placeholder="How Christmas, Easter, Eid, etc., will be spent..." />
                             <AgreementTextField control={form.control} name="holidaysBirthdaysEvents" label="3) Birthdays / other special events" placeholder="Arrangements for the child(ren)'s birthdays, parents' birthdays, Mother's/Father's Day..." />
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
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-center">Signed by</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Parent 1 Signature */}
                                <div className="space-y-2 border p-4 rounded-md text-center">
                                    <div className="h-12 border-b w-3/4 mx-auto mb-2"> {/* Signature Line */} </div>
                                     <FormField control={form.control} name="parent1SignatureName" render={({ field }) => ( <FormItem> <FormLabel>Name:</FormLabel> <FormControl><Input placeholder="Parent/Guardian 1 Printed Name" className="border-none text-center h-8" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                     <FormField control={form.control} name="parent1SignatureDate" render={({ field }) => ( <FormItem> <FormLabel>Date:</FormLabel> <FormControl><Input type="date" className="w-auto h-8" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                </div>
                                {/* Parent 2 Signature */}
                                 <div className="space-y-2 border p-4 rounded-md text-center">
                                    <div className="h-12 border-b w-3/4 mx-auto mb-2"> {/* Signature Line */} </div>
                                     <FormField control={form.control} name="parent2SignatureName" render={({ field }) => ( <FormItem> <FormLabel>Name:</FormLabel> <FormControl><Input placeholder="Parent/Guardian 2 Printed Name" className="border-none text-center h-8" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                     <FormField control={form.control} name="parent2SignatureDate" render={({ field }) => ( <FormItem> <FormLabel>Date:</FormLabel> <FormControl><Input type="date" className="w-auto h-8" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center mt-10">
                            <Button type="submit" size="lg">
                                <FileText className="mr-2 h-5 w-5" /> Save Separation Agreement Data
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </Layout>
    );
}