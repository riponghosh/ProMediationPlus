import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
  FormDescription, // Keep for potential future use
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle, Trash2, PlusCircle, Info } from "lucide-react"; // Added Info icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert component

/*
--------------------------------------------------------------------------
 SCHEMA DEFINITION - Based on the PDF Structure (Sections B & C)
--------------------------------------------------------------------------
We adapt the provided schema slightly to better match the PDF's specific fields,
especially focusing on weekly amounts as requested by the PDF.
We will omit Section A (Case/Personal Details) and Section D (Signature)
as the core request seems focused on the financial statement (Sections B & C)
and the provided TSX structure focuses on financial data per party.
We also add an 'expenses' section which was missing in the original TSX template
but is a major part of the PDF (Section B.2).
*/

// Schema for individual income/expense items (Weekly)
const weeklyItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(String(val))), // Handle empty string and parse
    z.number({ invalid_type_error: "Amount must be a number" }).nonnegative("Amount cannot be negative").optional()
  ),
  details: z.string().optional(), // For 'Other' categories
});

// Schema for Assets
const assetItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  value: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(String(val))),
    z.number({ invalid_type_error: "Value must be a number" }).nonnegative("Value cannot be negative").optional()
  ),
  details: z.string().optional(), // For 'Other Assets'
});

// Schema for Liabilities
const liabilityItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amountOwed: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(String(val))),
    z.number({ invalid_type_error: "Amount must be a number" }).nonnegative("Amount cannot be negative").optional()
  ),
  details: z.string().optional(), // For 'Other Liabilities'
});

// Define the schema for one party's statement of means, mirroring the PDF structure
const partyMeansSchema = z.object({
  // Section A - Basic Info (Simplified from PDF for context within this form)
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  // Address fields could be added if needed, but focusing on financials per PDF Sections B/C
  // addressLine1: z.string().optional(),
  // addressLine2: z.string().optional(),
  // townCity: z.string().optional(),
  // county: z.string().optional(),
  // eircode: z.string().optional(),
  // country: z.string().optional(),

  // Section B.1 - Income (Weekly)
  netEarnings: weeklyItemSchema.omit({ description: true }).optional(), // Specific field for net earnings
  socialWelfare: weeklyItemSchema.omit({ description: true }).optional(), // Specific field for social welfare
  pensions: weeklyItemSchema.omit({ description: true }).optional(), // Specific field for pensions
  otherIncome: weeklyItemSchema.omit({ description: true }).extend({ details: z.string().optional() }).optional(), // Specific field for other income

  // Section B.2 - Expenses (Weekly)
  // Housing
  rentMortgage: weeklyItemSchema.omit({ description: true }).optional(),
  propertyServiceManagementTax: weeklyItemSchema.omit({ description: true }).optional(),
  mortgageProtectionInsurance: weeklyItemSchema.omit({ description: true }).optional(),
  repairMaintenance: weeklyItemSchema.omit({ description: true }).optional(),
  // Utilities
  electricity: weeklyItemSchema.omit({ description: true }).optional(),
  heating: weeklyItemSchema.omit({ description: true }).optional(),
  telephoneOtherUtilities: weeklyItemSchema.omit({ description: true }).optional(),
  tvStreamingLicences: weeklyItemSchema.omit({ description: true }).optional(),
  // Personal
  foodHousekeeping: weeklyItemSchema.omit({ description: true }).optional(),
  clothingFootwearPersonal: weeklyItemSchema.omit({ description: true }).optional(), // Combined personal clothing/footwear
  lifeAssuranceOtherInsurance: weeklyItemSchema.omit({ description: true }).optional(),
  membershipsProfessionalSubscriptions: weeklyItemSchema.omit({ description: true }).optional(),
  pensionContributions: weeklyItemSchema.omit({ description: true }).optional(),
  medicalCostsPersonal: weeklyItemSchema.omit({ description: true }).optional(), // Combined personal medical
  maintenancePaidToSpouse: weeklyItemSchema.omit({ description: true }).optional(),
  personalLoanRepayments: weeklyItemSchema.omit({ description: true }).optional(),
  // Child
  childcareCosts: weeklyItemSchema.omit({ description: true }).optional(),
  educationalCosts: weeklyItemSchema.omit({ description: true }).optional(),
  clothingFootwearChild: weeklyItemSchema.omit({ description: true }).optional(), // Combined child clothing/footwear
  medicalCostsChild: weeklyItemSchema.omit({ description: true }).optional(), // Combined child medical
  childMaintenancePayments: weeklyItemSchema.omit({ description: true }).optional(),
  // Transport
  publicTransportCosts: weeklyItemSchema.omit({ description: true }).optional(),
  fuelCosts: weeklyItemSchema.omit({ description: true }).optional(),
  vehicleTax: weeklyItemSchema.omit({ description: true }).optional(),
  vehicleInsurance: weeklyItemSchema.omit({ description: true }).optional(),
  vehicleLoanRepayments: weeklyItemSchema.omit({ description: true }).optional(),
  // Other Expenses
  otherExpenses: weeklyItemSchema.omit({ description: true }).extend({ details: z.string().optional() }).optional(),

  // Section C.1 - Assets (Total Value)
  savings: assetItemSchema.omit({ description: true }).optional(),
  house: assetItemSchema.omit({ description: true }).optional(),
  vehicles: assetItemSchema.omit({ description: true }).optional(),
  pensionAsset: assetItemSchema.omit({ description: true }).optional(), // Renamed to avoid clash with income pension
  investments: assetItemSchema.omit({ description: true }).optional(),
  otherAssets: assetItemSchema.omit({ description: true }).extend({ details: z.string().optional() }).optional(),

  // Section C.2 - Liabilities (Total Amount Owed)
  vehicleLoans: liabilityItemSchema.omit({ description: true }).optional(),
  otherLoansHirePurchase: liabilityItemSchema.omit({ description: true }).optional(),
  creditCardDebt: liabilityItemSchema.omit({ description: true }).optional(),
  mortgagesLiability: liabilityItemSchema.omit({ description: true }).optional(), // Renamed to avoid clash
  otherLiabilities: liabilityItemSchema.omit({ description: true }).extend({ details: z.string().optional() }).optional(),

});

// Define the schema for the combined statement of means form
// We'll represent the Applicant and Respondent directly, mirroring the PDF's Section A roles
const statementOfMeansSchema = z.object({
  // Section A - Case Details (Minimal)
  caseNumber: z.string().optional(),
  courtOfficeName: z.string().optional(),

  // Applicant Details (incorporates Section A 'Your Details' / 'Name of Applicant' and Sections B/C)
  applicant: partyMeansSchema,

  // Respondent Details (incorporates Section A 'Name of Respondent' and Sections B/C)
  respondent: partyMeansSchema,

  // Section D - Date (Signature omitted for web form)
  statementDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date format" })
    .default(new Date().toISOString().split('T')[0]),

  // Add a field for the 'Additional Party' note from PDF page 1
  additionalPartiesNote: z.boolean().optional().default(false), // Checkbox perhaps? Or just informational.
});

type StatementOfMeansData = z.infer<typeof statementOfMeansSchema>;

// Helper component for rendering a standard input field for weekly amounts or total values
interface StandardAmountFieldProps {
    control: any;
    name: string;
    label: string;
    placeholder?: string;
    isWeekly?: boolean; // Flag to show '/ week'
}

const StandardAmountField: React.FC<StandardAmountFieldProps> = ({ control, name, label, placeholder = "€ Amount", isWeekly = false }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem className="flex-grow">
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder={placeholder.replace('€ ', '')} // Remove euro from placeholder if present
                            {...field}
                            value={field.value ?? ""} // Handle undefined/null from optional fields
                            onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} // Store as number or undefined
                            className="pl-7 pr-16" // Padding for € sign and '/ week' text
                        />
                        {isWeekly && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">/ week</span>}
                    </div>
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);

// Helper component for 'Other' fields with details textarea
interface OtherFieldProps {
    control: any;
    baseName: string; // e.g., "applicant.otherIncome"
    label: string;
    amountPlaceholder?: string;
    detailsPlaceholder: string;
    isWeekly?: boolean;
}

const OtherField: React.FC<OtherFieldProps> = ({ control, baseName, label, amountPlaceholder = "€ Amount", detailsPlaceholder, isWeekly = false }) => (
    <div className="space-y-2 p-3 border rounded-md bg-slate-50">
         <FormLabel className="font-medium">{label}</FormLabel>
         <div className="flex flex-col sm:flex-row gap-4">
            <StandardAmountField
                control={control}
                name={`${baseName}.amount`}
                label="Amount"
                placeholder={amountPlaceholder}
                isWeekly={isWeekly}
            />
            <FormField
                control={control}
                name={`${baseName}.details`}
                render={({ field }) => (
                    <FormItem className="flex-grow-[2]"> {/* Make details wider */}
                        <FormLabel>Details</FormLabel>
                        <FormControl>
                            <Textarea placeholder={detailsPlaceholder} {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    </div>
);


export function StatementOfMeansForm() {
  const form = useForm<StatementOfMeansData>({
    resolver: zodResolver(statementOfMeansSchema),
    defaultValues: {
      caseNumber: "",
      courtOfficeName: "",
      applicant: { firstName: "", lastName: "" }, // Initialize names
      respondent: { firstName: "", lastName: "" }, // Initialize names
      statementDate: new Date().toISOString().split('T')[0],
      // All financial fields default to undefined via schema
    },
  });

  function onSubmit(data: StatementOfMeansData) {
    console.log("Statement of Means Form Submitted:", data);
    // TODO: Implement saving logic (e.g., API call)
    toast.success("Statement of Means submitted successfully (simulated).");
  }

  // Helper to render the financial statement section for a party
  const renderPartyFinancials = (party: 'applicant' | 'respondent', partyLabel: string) => (
    <Accordion type="multiple" className="w-full space-y-4">

        {/* Section B.1 - Income */}
        <AccordionItem value={`${party}-income`} className="border rounded-md">
            <AccordionTrigger className="text-lg font-medium px-4 py-3 hover:no-underline bg-gray-50 rounded-t-md">
                {partyLabel} - Section B.1: Income (Weekly)
            </AccordionTrigger>
            <AccordionContent className="p-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StandardAmountField control={form.control} name={`${party}.netEarnings.amount`} label="Total Net Earnings*" isWeekly />
                    <StandardAmountField control={form.control} name={`${party}.socialWelfare.amount`} label="Total Social Welfare Payments Received" isWeekly />
                    <StandardAmountField control={form.control} name={`${party}.pensions.amount`} label="Total Pensions (Income)" isWeekly />
                 </div>
                 <p className="text-xs text-muted-foreground">*Earnings after tax and deductions</p>
                 <OtherField
                    control={form.control}
                    baseName={`${party}.otherIncome`}
                    label="Other Income"
                    detailsPlaceholder="Provide details of other income sources..."
                    isWeekly
                 />
                 {/* Total Income would be calculated, not entered */}
            </AccordionContent>
        </AccordionItem>

        {/* Section B.2 - Expenses */}
        <AccordionItem value={`${party}-expenses`} className="border rounded-md">
            <AccordionTrigger className="text-lg font-medium px-4 py-3 hover:no-underline bg-gray-50 rounded-t-md">
                 {partyLabel} - Section B.2: Expenses (Weekly)
            </AccordionTrigger>
            <AccordionContent className="p-4 space-y-6">
                {/* Housing */}
                <div className="space-y-4 p-3 border rounded-md">
                    <h4 className="font-medium text-base mb-2">Housing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StandardAmountField control={form.control} name={`${party}.rentMortgage.amount`} label="Rent (minus supports) / Mortgage" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.propertyServiceManagementTax.amount`} label="Property Service / Mgmt Charge / Property Tax" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.mortgageProtectionInsurance.amount`} label="Mortgage Protection Insurance" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.repairMaintenance.amount`} label="Repair and Maintenance" isWeekly />
                    </div>
                </div>

                {/* Utilities */}
                <div className="space-y-4 p-3 border rounded-md">
                    <h4 className="font-medium text-base mb-2">Utilities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StandardAmountField control={form.control} name={`${party}.electricity.amount`} label="Electricity" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.heating.amount`} label="Heating (Gas, Oil etc)" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.telephoneOtherUtilities.amount`} label="Telephone / Other Utilities" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.tvStreamingLicences.amount`} label="TV/Streaming/Licences" isWeekly />
                    </div>
                </div>

                {/* Personal */}
                 <div className="space-y-4 p-3 border rounded-md">
                    <h4 className="font-medium text-base mb-2">Personal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StandardAmountField control={form.control} name={`${party}.foodHousekeeping.amount`} label="Food / Housekeeping" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.clothingFootwearPersonal.amount`} label="Clothing / Footwear" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.lifeAssuranceOtherInsurance.amount`} label="Life Assurance / Other Insurance" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.membershipsProfessionalSubscriptions.amount`} label="Memberships / Professional Subscriptions" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.pensionContributions.amount`} label="Pension Contributions" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.medicalCostsPersonal.amount`} label="Medical Costs" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.maintenancePaidToSpouse.amount`} label="Maintenance Paid to Spouse" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.personalLoanRepayments.amount`} label="Personal Loan Repayments" isWeekly />
                    </div>
                </div>

                 {/* Child */}
                 <div className="space-y-4 p-3 border rounded-md">
                    <h4 className="font-medium text-base mb-2">Child</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StandardAmountField control={form.control} name={`${party}.childcareCosts.amount`} label="Childcare Costs" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.educationalCosts.amount`} label="Educational Costs" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.clothingFootwearChild.amount`} label="Clothing / Footwear (Child)" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.medicalCostsChild.amount`} label="Medical Costs (Child)" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.childMaintenancePayments.amount`} label="Child Maintenance Payments" isWeekly />
                    </div>
                </div>

                 {/* Transport */}
                 <div className="space-y-4 p-3 border rounded-md">
                    <h4 className="font-medium text-base mb-2">Transport</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StandardAmountField control={form.control} name={`${party}.publicTransportCosts.amount`} label="Public Transport Costs" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.fuelCosts.amount`} label="Fuel Costs" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.vehicleTax.amount`} label="Vehicle Tax" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.vehicleInsurance.amount`} label="Vehicle Insurance" isWeekly />
                        <StandardAmountField control={form.control} name={`${party}.vehicleLoanRepayments.amount`} label="Vehicle Loan Repayments" isWeekly />
                    </div>
                </div>

                 {/* Other Expenses */}
                 <OtherField
                    control={form.control}
                    baseName={`${party}.otherExpenses`}
                    label="Other Expenses"
                    detailsPlaceholder="Provide details of other regular expenses..."
                    isWeekly
                 />
                 {/* Total Expenses would be calculated */}
            </AccordionContent>
        </AccordionItem>

        {/* Section C.1 - Assets */}
        <AccordionItem value={`${party}-assets`} className="border rounded-md">
            <AccordionTrigger className="text-lg font-medium px-4 py-3 hover:no-underline bg-gray-50 rounded-t-md">
                {partyLabel} - Section C.1: Assets (Total Value)
            </AccordionTrigger>
            <AccordionContent className="p-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StandardAmountField control={form.control} name={`${party}.savings.value`} label="Savings" />
                    <StandardAmountField control={form.control} name={`${party}.house.value`} label="House" />
                    <StandardAmountField control={form.control} name={`${party}.vehicles.value`} label="Vehicles (Car, Van, etc)" />
                    <StandardAmountField control={form.control} name={`${party}.pensionAsset.value`} label="Pension (Asset Value)" />
                    <StandardAmountField control={form.control} name={`${party}.investments.value`} label="Investments" />
                 </div>
                 <OtherField
                    control={form.control}
                    baseName={`${party}.otherAssets`}
                    label="Other Assets"
                    amountPlaceholder="€ Total Value"
                    detailsPlaceholder="Provide details of other assets (e.g., stocks, shares)..."
                 />
                 {/* Total Assets would be calculated */}
            </AccordionContent>
        </AccordionItem>

        {/* Section C.2 - Liabilities */}
        <AccordionItem value={`${party}-liabilities`} className="border rounded-md">
            <AccordionTrigger className="text-lg font-medium px-4 py-3 hover:no-underline bg-gray-50 rounded-t-md">
                {partyLabel} - Section C.2: Liabilities (Total Amount Owed)
            </AccordionTrigger>
            <AccordionContent className="p-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StandardAmountField control={form.control} name={`${party}.vehicleLoans.amountOwed`} label="Vehicle Loans" />
                    <StandardAmountField control={form.control} name={`${party}.otherLoansHirePurchase.amountOwed`} label="Other Loans or Hire Purchase" />
                    <StandardAmountField control={form.control} name={`${party}.creditCardDebt.amountOwed`} label="Credit Card Debt" />
                    <StandardAmountField control={form.control} name={`${party}.mortgagesLiability.amountOwed`} label="Mortgages" />
                 </div>
                 <OtherField
                    control={form.control}
                    baseName={`${party}.otherLiabilities`}
                    label="Other Liabilities"
                    amountPlaceholder="€ Amount Owed"
                    detailsPlaceholder="Provide details of other debts or obligations..."
                 />
                 {/* Total Liabilities would be calculated */}
            </AccordionContent>
        </AccordionItem>

    </Accordion>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4 md:p-6 border rounded-md shadow-sm bg-white">

        {/* Section A - Case Details (Top Level) */}
        <div className="space-y-4 p-4 border rounded-md bg-slate-50">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Section A: Case Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="caseNumber" render={({ field }) => ( <FormItem> <FormLabel>Case Number (if known)</FormLabel> <FormControl><Input placeholder="Case Number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="courtOfficeName" render={({ field }) => ( <FormItem> <FormLabel>Court Office Name</FormLabel> <FormControl><Input placeholder="Court Office Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
             <Alert variant="default" className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-700" />
                <AlertTitle className="text-blue-800">Additional Parties</AlertTitle>
                <AlertDescription className="text-blue-700">
                    If there are additional parties in this case, please use the separate ‘Additional Party' form available on courts.ie.
                </AlertDescription>
            </Alert>
        </div>

        {/* Helpful Tip from PDF */}
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-700" />
            <AlertTitle className="text-yellow-800">Helpful Tip: Weekly Amounts</AlertTitle>
            <AlertDescription className="text-yellow-700 space-y-1">
                <p>Please provide income and expenses in weekly amounts (€ per week).</p>
                <ul className="list-disc list-inside text-sm">
                    <li>If you have <span className="font-semibold">fortnightly</span> figures: Divide by 2</li>
                    <li>If you have <span className="font-semibold">monthly</span> figures: Divide by 4.3</li>
                    <li>If you have <span className="font-semibold">quarterly</span> figures: Divide by 13</li>
                    <li>If you have <span className="font-semibold">yearly / annual</span> figures: Divide by 52</li>
                </ul>
                 <p className="text-xs">Use a calculator to help convert your figures accurately.</p>
            </AlertDescription>
        </Alert>

        {/* Applicant Section */}
        <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Applicant Details & Financial Statement</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="applicant.firstName" render={({ field }) => ( <FormItem> <FormLabel>Applicant First Name</FormLabel> <FormControl><Input placeholder="First Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name="applicant.lastName" render={({ field }) => ( <FormItem> <FormLabel>Applicant Last Name</FormLabel> <FormControl><Input placeholder="Last Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 {/* Add Address fields here if needed */}
            </div>
            {renderPartyFinancials('applicant', 'Applicant')}
        </div>

        {/* Respondent Section */}
        <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Respondent Details & Financial Statement</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="respondent.firstName" render={({ field }) => ( <FormItem> <FormLabel>Respondent First Name</FormLabel> <FormControl><Input placeholder="First Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name="respondent.lastName" render={({ field }) => ( <FormItem> <FormLabel>Respondent Last Name</FormLabel> <FormControl><Input placeholder="Last Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 {/* Add Address fields here if needed */}
            </div>
            {renderPartyFinancials('respondent', 'Respondent')}
        </div>


        {/* Section D - Date */}
         <div className="space-y-4 p-4 border rounded-md bg-slate-50">
             <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Section D: Date</h2>
             <FormField
                control={form.control}
                name="statementDate"
                render={({ field }) => (
                <FormItem className="w-full md:w-1/3">
                    <FormLabel>Statement Date</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} className="text-sm h-10"/>
                    </FormControl>
                     <FormMessage />
                </FormItem>
                )}
            />
            <p className="text-sm text-muted-foreground">Signature is typically handled separately for legal documents.</p>
        </div>


        <Button type="submit" size="lg">Submit Statement of Means</Button>
      </form>
    </Form>
  );
}