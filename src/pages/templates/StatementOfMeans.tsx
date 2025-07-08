import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Link } from 'react-router-dom';
import { ChevronLeft, Download, FileText, Info, PlusCircle, MinusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAllCaseFileNumbers } from '@/services/localDbService';
import { Separator } from '@/components/ui/separator';

// --- Zod Schema Definition ---
const statementOfMeansSchema = z.object({
  linkedCaseFileNumber: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  address: z.string().min(1, "Address is required."),
  weeklyOutgoingsAmount: z.string().optional(), // Can be calculated later

  // First Schedule: Assets
  assets: z.array(z.object({
    assetType: z.string().optional(),
    value: z.string().optional(),
    finance: z.string().optional(),
  })).default([{ assetType: "", value: "", finance: "" }]),

  savings: z.array(z.object({
    accountType: z.string().optional(),
    institutionName: z.string().optional(),
    balance: z.string().optional(),
    accountJointOrPersonal: z.string().optional(),
  })).default([{ accountType: "", institutionName: "", balance: "", accountJointOrPersonal: "" }]),

  // Second Schedule: Income
  employmentStatus: z.enum(["employed", "self-employed", "neither"]).optional(),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  annualSalary: z.string().optional(),
  netMonthlyIncome: z.string().optional(),
  companyName: z.string().optional(),
  position: z.string().optional(),
  selfEmployedIncome: z.string().optional(),

  socialWelfareBenefits: z.string().optional(),
  maintenanceIncome: z.string().optional(),
  rentalIncome: z.string().optional(),
  otherSourcesIncome: z.string().optional(),

  // Third Schedule: Debts and Liabilities
  mortgages: z.array(z.object({
    accountType: z.string().optional(),
    institutionName: z.string().optional(),
    balance: z.string().optional(),
    monthlyRepayments: z.string().optional(),
    arrears: z.enum(["Y", "N"]).optional(),
  })).default([{ accountType: "", institutionName: "", balance: "", monthlyRepayments: "", arrears: "N" }]),

  loans: z.array(z.object({
    accountName: z.string().optional(),
    institutionName: z.string().optional(),
    balance: z.string().optional(),
    monthlyRepayments: z.string().optional(),
  })).default([{ accountName: "", institutionName: "", balance: "", monthlyRepayments: "" }]),

  creditCards: z.array(z.object({
    cardName: z.string().optional(),
    institutionName: z.string().optional(),
    currentBalance: z.string().optional(),
    monthlyRepayments: z.string().optional(),
  })).default([{ cardName: "", institutionName: "", currentBalance: "", monthlyRepayments: "" }]),

  // Fourth Schedule: Outgoings
  mortgageRent: z.string().optional(),
  healthInsurance: z.string().optional(),
  houseInsurance: z.string().optional(),
  lifeAssurance: z.string().optional(),
  houseMaintenance: z.string().optional(),
  medicalDentalPersonal: z.string().optional(),
  localPropertyTax: z.string().optional(),
  medicalDentalChildren: z.string().optional(),
  electricity: z.string().optional(),
  groceries: z.string().optional(),
  gasOilHeating: z.string().optional(),
  clothingPersonal: z.string().optional(),
  binCharges: z.string().optional(),
  clothingChildren: z.string().optional(),
  mobilePhoneLandline: z.string().optional(),
  socialPersonal: z.string().optional(),
  tvLicence: z.string().optional(),
  socialChildren: z.string().optional(),
  tvSubscriptionServices: z.string().optional(),
  schoolExpenses: z.string().optional(),
  carRepayments: z.string().optional(),
  crecheAfterschoolFees: z.string().optional(),
  petrolDiesel: z.string().optional(),
  extraCircularExpenses: z.string().optional(),
  carTax: z.string().optional(),
  petExpenses: z.string().optional(),
  carInsurance: z.string().optional(),
  christmasBirthdayPresents: z.string().optional(),
  carMaintenanceServicing: z.string().optional(),
  holidays: z.string().optional(),
  creditCardRepaymentsOutgoings: z.string().optional(), // Renamed to avoid conflict
  anyOtherExpenses: z.string().optional(),
  loanRepaymentsOutgoings: z.string().optional(), // Renamed to avoid conflict

  // Fifth Schedule: Pension Details
  pensions: z.array(z.object({
    fundName: z.string().optional(),
    institutionName: z.string().optional(),
    currentValue: z.string().optional(),
  })).default([{ fundName: "", institutionName: "", currentValue: "" }]),

  // Totals (calculated, not directly input)
  totalMonthlyExpenditure: z.string().optional(),
  totalMonthlyIncome: z.string().optional(),
  deficitCredit: z.string().optional(),

  // Signature
  signatureName: z.string().optional(),
  signatureDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
});

type StatementOfMeansData = z.infer<typeof statementOfMeansSchema>;

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
  name: keyof StatementOfMeansData;
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
    name: keyof StatementOfMeansData;
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

export function StatementOfMeansBuilder() {
  const isMobile = useIsMobile();
  const [caseFileNumbers, setCaseFileNumbers] = useState<string[]>([]);
  const form = useForm<StatementOfMeansData>({
    resolver: zodResolver(statementOfMeansSchema),
    defaultValues: {
      linkedCaseFileNumber: undefined,
      name: "",
      address: "",
      weeklyOutgoingsAmount: "",
      assets: [{ assetType: "", value: "", finance: "" }],
      savings: [{ accountType: "", institutionName: "", balance: "", accountJointOrPersonal: "" }],
      employmentStatus: undefined,
      employerName: "",
      jobTitle: "",
      annualSalary: "",
      netMonthlyIncome: "",
      companyName: "",
      position: "",
      selfEmployedIncome: "",
      socialWelfareBenefits: "",
      maintenanceIncome: "",
      rentalIncome: "",
      otherSourcesIncome: "",
      mortgages: [{ accountType: "", institutionName: "", balance: "", monthlyRepayments: "", arrears: "N" }],
      loans: [{ accountName: "", institutionName: "", balance: "", monthlyRepayments: "" }],
      creditCards: [{ cardName: "", institutionName: "", currentBalance: "", monthlyRepayments: "" }],
      mortgageRent: "",
      healthInsurance: "",
      houseInsurance: "",
      lifeAssurance: "",
      houseMaintenance: "",
      medicalDentalPersonal: "",
      localPropertyTax: "",
      medicalDentalChildren: "",
      electricity: "",
      groceries: "",
      gasOilHeating: "",
      clothingPersonal: "",
      binCharges: "",
      clothingChildren: "",
      mobilePhoneLandline: "",
      socialPersonal: "",
      tvLicence: "",
      socialChildren: "",
      tvSubscriptionServices: "",
      schoolExpenses: "",
      carRepayments: "",
      crecheAfterschoolFees: "",
      petrolDiesel: "",
      extraCircularExpenses: "",
      carTax: "",
      petExpenses: "",
      carInsurance: "",
      christmasBirthdayPresents: "",
      carMaintenanceServicing: "",
      holidays: "",
      creditCardRepaymentsOutgoings: "",
      anyOtherExpenses: "",
      loanRepaymentsOutgoings: "",
      pensions: [{ fundName: "", institutionName: "", currentValue: "" }],
      totalMonthlyExpenditure: "",
      totalMonthlyIncome: "",
      deficitCredit: "",
      signatureName: "",
      signatureDate: new Date().toISOString().split('T')[0],
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const watchedName = form.watch("name");

  // Field Arrays
  const { fields: assetFields, append: appendAsset, remove: removeAsset } = useFieldArray({
    control: form.control,
    name: "assets",
  });
  const { fields: savingsFields, append: appendSaving, remove: removeSaving } = useFieldArray({
    control: form.control,
    name: "savings",
  });
  const { fields: mortgageFields, append: appendMortgage, remove: removeMortgage } = useFieldArray({
    control: form.control,
    name: "mortgages",
  });
  const { fields: loanFields, append: appendLoan, remove: removeLoan } = useFieldArray({
    control: form.control,
    name: "loans",
  });
  const { fields: creditCardFields, append: appendCreditCard, remove: removeCreditCard } = useFieldArray({
    control: form.control,
    name: "creditCards",
  });
  const { fields: pensionFields, append: appendPension, remove: removePension } = useFieldArray({
    control: form.control,
    name: "pensions",
  });

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

  useEffect(() => {
    if (watchedName && !form.getValues("signatureName")) {
      form.setValue("signatureName", watchedName, { shouldValidate: false });
    }
  }, [watchedName, form]);

  function onSubmit(data: StatementOfMeansData) {
    console.log("Statement of Means Data:", JSON.stringify(data, null, 2));
    toast.success("Statement of Means data saved (simulated).");
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

      pdf.save('StatementOfMeans.pdf');
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
                    <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Statement of Means</h1>
                    <p className="text-muted-foreground text-sm">
                        Create a detailed statement of financial means.
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
                    <p>This form helps you structure a Statement of Means. Fill in the details as accurately as possible.</p>
                    <p>It is strongly advised that you seek independent legal and financial advice before completing and signing this document. This template is for guidance and may need adaptation to specific circumstances.</p>
                </AlertDescription>
            </Alert>

            <h1 className="text-2xl font-bold text-center text-purple-800">STATEMENT OF MEANS</h1>

            <AgreementSection title="Personal Details">
                <p>I, <AgreementInputField control={form.control} name="name" label="Your Name" placeholder="Full Name" className="inline-block w-auto" /> of <AgreementTextField control={form.control} name="address" label="Your Address" placeholder="Your Full Address" rows={1} className="inline-block w-auto" /> being aged 18 years and upwards say that I make this Statement of Means from facts within my own knowledge save where otherwise appears and where so appearing I believe the same to be true.</p>
                <p>I say that I have set out in the First Schedule all the assets to which I am legally or beneficially entitled and the manner in which such property is held.</p>
                <p>I say that I have set out in the Second Schedule all income which I receive and the sources of such income.</p>
                <p>I say that I have set out in the Third Schedule all my debts and liabilities and the persons to whom such debts and liabilities are due.</p>
                <p>I say that my weekly outgoings amount to the sum of €<AgreementInputField control={form.control} name="weeklyOutgoingsAmount" label="Weekly Outgoings Amount" placeholder="Amount" className="inline-block w-auto" /> and I say that the details of such outgoings have been set out in the Fourth Schedule of this Statement.</p>
                <p>I say that to the best of my knowledge, information and belief, all pension information known to me is set out in the Fifth Schedule.</p>
            </AgreementSection>

            <AgreementSection title="First Schedule (Assets)">
                <p className="text-sm text-muted-foreground mb-4">This can include family home, shares, cars, second properties etc.</p>
                {assetFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-4 rounded-md relative">
                        <AgreementInputField control={form.control} name={`assets.${index}.assetType`} label="Asset Type" placeholder="e.g., Family Home" />
                        <AgreementInputField control={form.control} name={`assets.${index}.value`} label="Value of Asset (€)" placeholder="e.g., 300000" type="number" />
                        <AgreementInputField control={form.control} name={`assets.${index}.finance`} label="Finance on Asset (€)" placeholder="e.g., 150000" type="number" />
                        <div className="flex items-end justify-end">
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeAsset(index)}>
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendAsset({ assetType: "", value: "", finance: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Asset
                </Button>

                <Separator className="my-6" />

                <h4 className="text-lg font-semibold mb-3">Savings</h4>
                <p className="text-sm text-muted-foreground mb-4">Please include the name of institution, the account number, and the balance on the account. Please specific joint our personal account.</p>
                {savingsFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded-md relative">
                        <AgreementInputField control={form.control} name={`savings.${index}.accountType`} label="Account Type" placeholder="e.g., Current Account" />
                        <AgreementInputField control={form.control} name={`savings.${index}.institutionName`} label="Name of Institution" placeholder="e.g., Bank of Ireland" />
                        <AgreementInputField control={form.control} name={`savings.${index}.balance`} label="Balance in Account (€)" placeholder="e.g., 5000" type="number" />
                        <FormField
                            control={form.control}
                            name={`savings.${index}.accountJointOrPersonal`}
                            render={({ field: selectField }) => (
                                <FormItem>
                                    <FormLabel>Joint or Personal Account</FormLabel>
                                    <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Joint">Joint</SelectItem>
                                            <SelectItem value="Personal">Personal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-end justify-end">
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeSaving(index)}>
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendSaving({ accountType: "", institutionName: "", balance: "", accountJointOrPersonal: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Saving Account
                </Button>
            </AgreementSection>

            <AgreementSection title="Second Schedule (Income)">
                <h4 className="text-lg font-semibold mb-3">Employment Status</h4>
                <FormField
                    control={form.control}
                    name="employmentStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Are you:</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select employment status" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="employed">Employed</SelectItem>
                                    <SelectItem value="self-employed">Self-employed</SelectItem>
                                    <SelectItem value="neither">Neither of the above</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.watch("employmentStatus") === "employed" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <AgreementInputField control={form.control} name="employerName" label="Employer's Name" placeholder="Employer's Name" />
                        <AgreementInputField control={form.control} name="jobTitle" label="Job Title" placeholder="Job Title" />
                        <AgreementInputField control={form.control} name="annualSalary" label="Annual Salary (€)" placeholder="Annual Salary" type="number" />
                        <AgreementInputField control={form.control} name="netMonthlyIncome" label="Net Monthly Income (€)" placeholder="Net Monthly Income" type="number" />
                    </div>
                )}

                {form.watch("employmentStatus") === "self-employed" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <AgreementInputField control={form.control} name="companyName" label="Company Name" placeholder="Company Name" />
                        <AgreementInputField control={form.control} name="position" label="Position" placeholder="Position" />
                        <AgreementInputField control={form.control} name="selfEmployedIncome" label="Income (€)" placeholder="Income" type="number" />
                    </div>
                )}

                <Separator className="my-6" />

                <h4 className="text-lg font-semibold mb-3">Other sources of income:</h4>
                <AgreementTextField control={form.control} name="socialWelfareBenefits" label="Social Welfare benefit(s)" placeholder="Please itemise payment(s) & amount(s)" rows={2} />
                <AgreementInputField control={form.control} name="maintenanceIncome" label="Maintenance (€)" placeholder="Amount" type="number" />
                <AgreementInputField control={form.control} name="rentalIncome" label="Rental income (€)" placeholder="Amount" type="number" />
                <AgreementInputField control={form.control} name="otherSourcesIncome" label="Any other sources (€)" placeholder="Amount" type="number" />
            </AgreementSection>

            <AgreementSection title="Third Schedule (Debts and Liabilities)">
                <h4 className="text-lg font-semibold mb-3">Rent / Mortgage repayments:</h4>
                <p className="text-sm text-muted-foreground mb-4">In the case of mortgage repayments, please give details of the lending institution, current balance of the mortgage, the monthly repayment figure, and any arrears.</p>
                {mortgageFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 border p-4 rounded-md relative">
                        <AgreementInputField control={form.control} name={`mortgages.${index}.accountType`} label="Account Type" placeholder="e.g., Mortgage" />
                        <AgreementInputField control={form.control} name={`mortgages.${index}.institutionName`} label="Name of Institution" placeholder="e.g., AIB" />
                        <AgreementInputField control={form.control} name={`mortgages.${index}.balance`} label="Balance of Mortgage (€)" placeholder="e.g., 200000" type="number" />
                        <AgreementInputField control={form.control} name={`mortgages.${index}.monthlyRepayments`} label="Monthly Repayments (€)" placeholder="e.g., 800" type="number" />
                        <FormField
                            control={form.control}
                            name={`mortgages.${index}.arrears`}
                            render={({ field: selectField }) => (
                                <FormItem>
                                    <FormLabel>Arrears?</FormLabel>
                                    <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Y">Yes</SelectItem>
                                            <SelectItem value="N">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-end justify-end">
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeMortgage(index)}>
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendMortgage({ accountType: "", institutionName: "", balance: "", monthlyRepayments: "", arrears: "N" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Mortgage
                </Button>

                <Separator className="my-6" />

                <h4 className="text-lg font-semibold mb-3">Other Liabilities (Loans)</h4>
                <p className="text-sm text-muted-foreground mb-4">Please include the name of the institution, the account number and the balance on the loan.</p>
                {loanFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded-md relative">
                        <AgreementInputField control={form.control} name={`loans.${index}.accountName`} label="Account Name" placeholder="e.g., Car Loan" />
                        <AgreementInputField control={form.control} name={`loans.${index}.institutionName`} label="Name of Institution" placeholder="e.g., Credit Union" />
                        <AgreementInputField control={form.control} name={`loans.${index}.balance`} label="Balance of Loan (€)" placeholder="e.g., 10000" type="number" />
                        <AgreementInputField control={form.control} name={`loans.${index}.monthlyRepayments`} label="Monthly Repayments (€)" placeholder="e.g., 200" type="number" />
                        <div className="flex items-end justify-end">
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeLoan(index)}>
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendLoan({ accountName: "", institutionName: "", balance: "", monthlyRepayments: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Loan
                </Button>

                <Separator className="my-6" />

                <h4 className="text-lg font-semibold mb-3">Credit Card(s)</h4>
                {creditCardFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded-md relative">
                        <AgreementInputField control={form.control} name={`creditCards.${index}.cardName`} label="Name on Credit Card" placeholder="e.g., Visa" />
                        <AgreementInputField control={form.control} name={`creditCards.${index}.institutionName`} label="Name of Lending Institution" placeholder="e.g., Bank of Ireland" />
                        <AgreementInputField control={form.control} name={`creditCards.${index}.currentBalance`} label="Current Balance (€)" placeholder="e.g., 1500" type="number" />
                        <AgreementInputField control={form.control} name={`creditCards.${index}.monthlyRepayments`} label="Monthly Repayments (€)" placeholder="e.g., 50" type="number" />
                        <div className="flex items-end justify-end">
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeCreditCard(index)}>
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendCreditCard({ cardName: "", institutionName: "", currentBalance: "", monthlyRepayments: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Credit Card
                </Button>
            </AgreementSection>

            <AgreementSection title="Fourth Schedule (Outgoings)">
                <h4 className="text-lg font-semibold mb-3">Monthly Outgoings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AgreementInputField control={form.control} name="mortgageRent" label="Mortgage repayments/ rent (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="healthInsurance" label="Health Insurance (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="houseInsurance" label="House insurance (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="lifeAssurance" label="Life assurance (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="houseMaintenance" label="House maintenance (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="medicalDentalPersonal" label="Medical/ dental (personal) (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="localPropertyTax" label="Local Property Tax (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="medicalDentalChildren" label="Medical/ dental (children) (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="electricity" label="Electricity (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="groceries" label="Groceries (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="gasOilHeating" label="Gas/oil/heating (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="clothingPersonal" label="Clothing (personal) (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="binCharges" label="Bin charges (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="clothingChildren" label="Clothing (children) (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="mobilePhoneLandline" label="Mobile phone/landline (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="socialPersonal" label="Social (personal) (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="tvLicence" label="TV licence (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="socialChildren" label="Social (children) (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="tvSubscriptionServices" label="TV subscription services (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="schoolExpenses" label="School expenses (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="carRepayments" label="Car repayments (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="crecheAfterschoolFees" label="Creche/afterschool fees (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="petrolDiesel" label="Petrol/diesel (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="extraCircularExpenses" label="Extra circular expenses (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="carTax" label="Car tax (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="petExpenses" label="Pet expenses (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="carInsurance" label="Car insurance (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="christmasBirthdayPresents" label="Christmas/ birthday presents (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="carMaintenanceServicing" label="Car maintenance/ servicing (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="holidays" label="Holidays (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="creditCardRepaymentsOutgoings" label="Credit card repayments (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="anyOtherExpenses" label="Any other expenses (€)" placeholder="Amount" type="number" />
                    <AgreementInputField control={form.control} name="loanRepaymentsOutgoings" label="Loan repayments (€)" placeholder="Amount" type="number" />
                </div>
            </AgreementSection>

            <AgreementSection title="Fifth Schedule (Pension Details)">
                <h4 className="text-lg font-semibold mb-3">Pensions</h4>
                <p className="text-sm text-muted-foreground mb-4">Please give details of any pensions you hold. *A pension statement must be provided, dated within the last 6 months.</p>
                {pensionFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-4 rounded-md relative">
                        <AgreementInputField control={form.control} name={`pensions.${index}.fundName`} label="Pension Fund Name" placeholder="e.g., XYZ Pension" />
                        <AgreementInputField control={form.control} name={`pensions.${index}.institutionName`} label="Name of Institution" placeholder="e.g., ABC Life" />
                        <AgreementInputField control={form.control} name={`pensions.${index}.currentValue`} label="Current Value (€)*" placeholder="e.g., 50000" type="number" />
                        <div className="flex items-end justify-end">
                            <Button type="button" variant="destructive" size="icon" onClick={() => removePension(index)}>
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendPension({ fundName: "", institutionName: "", currentValue: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Pension
                </Button>
            </AgreementSection>

            <AgreementSection title="Summary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AgreementInputField control={form.control} name="totalMonthlyExpenditure" label="TOTAL MONTHLY EXPENDITURE (€)" placeholder="Calculated Total" type="number" readOnly />
                    <AgreementInputField control={form.control} name="totalMonthlyIncome" label="Total Monthly Income (€)" placeholder="Calculated Total" type="number" readOnly />
                    <AgreementInputField control={form.control} name="deficitCredit" label="Deficit / Credit (€)" placeholder="Calculated Difference" type="number" readOnly />
                </div>
            </AgreementSection>

            <AgreementSection title="Statement of Truth">
                <p>In signing this document, I confirm that I honestly believe the facts provided by me in this Statement of Means to be true and confirm that the information I have provided is a full disclosure of my assets in accordance with section 11(3)(a)(ii) of the Mediation Act 2017.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="space-y-2 border p-4 rounded-md text-center">
                        <FormLabel className="font-semibold">Signed</FormLabel>
                        <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"></div>
                        <AgreementInputField control={form.control} name="signatureName" label="Printed Name" placeholder="Your Printed Name" />
                    </div>
                    <div className="space-y-2 border p-4 rounded-md text-center">
                        <FormLabel className="font-semibold">Date</FormLabel>
                        <div className="h-12 border-b w-3/4 mx-auto mt-4 mb-2"></div>
                        <AgreementInputField control={form.control} name="signatureDate" label="Date" type="date" />
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