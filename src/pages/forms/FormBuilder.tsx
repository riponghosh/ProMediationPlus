import React, { useState, useEffect } from "react"; // Added useEffect
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "react-beautiful-dnd";
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    GripVertical,
    Trash2,
    PlusCircle,
    ChevronsUpDown,
    Check,
    Info,
} from "lucide-react";
import { addItem, putItem } from "../../services/localDbService";
import type { SavedForm } from "../../types/models"; // Corrected import path for SavedForm

// Define props for TemplateBuilder (This is the one we keep and ensure is used)
export interface TemplateBuilderProps {
  initialData?: SavedForm;
  caseId?: string;
  onFormSave?: (data: SavedForm) => void;
  onFormUpdate?: (data: SavedForm) => void;
  formId?: string;
}

// --- Zod Schemas ---

// Base item schemas (adapt as needed)
const financialItemSchema = z.object({
    id: z.string().default(() => uuidv4()),
    description: z.string().min(1, "Description is required"),
    amount: z.preprocess(
        (val) => (val === "" ? undefined : parseFloat(String(val))),
        z.number({ invalid_type_error: "Must be a number" }).nonnegative("Cannot be negative").optional()
    ),
    frequency: z.enum(["Weekly", "Monthly", "Annually", "Total"]).optional(), // Example frequency
});

const textSectionDataSchema = z.object({
    content: z.string().optional(),
});

const financialListSectionDataSchema = z.object({
    items: z.array(financialItemSchema).default([]),
    notes: z.string().optional(),
});

// Define possible section types and their corresponding data schemas
const sectionSchema = z.discriminatedUnion("type", [
    z.object({
        id: z.string().default(() => uuidv4()),
        type: z.literal("PARTY_DETAILS"),
        title: z.string().default("Party Details"),
        data: z.object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            role: z.enum(["Applicant", "Respondent", "Other"]).optional(),
        }),
    }),
    z.object({
        id: z.string().default(() => uuidv4()),
        type: z.literal("INCOME"),
        title: z.string().default("Income (Weekly)"),
        data: financialListSectionDataSchema,
    }),
    z.object({
        id: z.string().default(() => uuidv4()),
        type: z.literal("EXPENSES"),
        title: z.string().default("Expenses (Weekly)"),
        data: financialListSectionDataSchema,
    }),
    z.object({
        id: z.string().default(() => uuidv4()),
        type: z.literal("ASSETS"),
        title: z.string().default("Assets (Total Value)"),
        data: financialListSectionDataSchema,
    }),
    z.object({
        id: z.string().default(() => uuidv4()),
        type: z.literal("LIABILITIES"),
        title: z.string().default("Liabilities (Total Owed)"),
        data: financialListSectionDataSchema,
    }),
    z.object({
        id: z.string().default(() => uuidv4()),
        type: z.literal("CUSTOM_TEXT"),
        title: z.string().default("Notes / Explanations"),
        data: textSectionDataSchema,
    }),
    // Add more predefined section types here if needed
]);

type Section = z.infer<typeof sectionSchema>;

const statementOfMeansSchema = z.object({
    id: z.string().default(() => uuidv4()), // Added top-level ID for the form itself
    formTitle: z.string().min(1, "Form title is required").default("Untitled Form"), // Renamed from statementTitle for clarity and made required
    formDescription: z.string().optional(), // Optional description for the form
    statementDate: z.string().optional().default(new Date().toISOString().split('T')[0]),
    sections: z.array(sectionSchema).default([]),
});

type StatementOfMeansData = z.infer<typeof statementOfMeansSchema>;

// --- Helper Components ---

// Component to render the fields for a financial list section (Income, Expenses, Assets, Liabilities)
interface FinancialListSectionProps {
    control: any;
    sectionIndex: number;
    sectionType: "INCOME" | "EXPENSES" | "ASSETS" | "LIABILITIES"; // To adjust labels/placeholders
}

const FinancialListSectionFields: React.FC<FinancialListSectionProps> = ({
    control,
    sectionIndex,
    sectionType,
}) => {
    const basePath = `sections.${sectionIndex}.data.items`;
    const { fields, append, remove } = useFieldArray({
        control,
        name: basePath,
    });

    const getAmountLabel = () => {
        switch (sectionType) {
            case "INCOME":
            case "EXPENSES":
                return "Amount (€ / week)";
            case "ASSETS":
                return "Value (€ Total)";
            case "LIABILITIES":
                return "Amount Owed (€ Total)";
            default:
                return "Amount (€)";
        }
    };

    return (
        <div className="space-y-4">
            {fields.map((item, itemIndex) => (
                <div key={item.id} className="flex items-start space-x-2 border p-3 rounded-md bg-white">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField
                            control={control}
                            name={`${basePath}.${itemIndex}.description`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Salary, Rent, Savings Account" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`${basePath}.${itemIndex}.amount`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">{getAmountLabel()}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Optional: Add Frequency Dropdown if needed */}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(itemIndex)}
                        className="mt-6" // Adjust alignment
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ id: uuidv4(), description: "", amount: undefined })}
            >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
             <FormField
                control={control}
                name={`sections.${sectionIndex}.data.notes`}
                render={({ field }) => (
                    <FormItem className="mt-4">
                        <FormLabel>Section Notes (Optional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder={`Any specific notes for this ${sectionType.toLowerCase()} section...`} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

// --- Main Builder Component ---

export function TemplateBuilder({ 
    initialData, 
    caseId, 
    onFormSave, 
    onFormUpdate, 
    formId 
}: TemplateBuilderProps) { // Use the exported TemplateBuilderProps
    const form = useForm<StatementOfMeansData>({
        resolver: zodResolver(statementOfMeansSchema),
        // Default values will be overridden by initialData if provided
        defaultValues: initialData || {
            id: uuidv4(),
            formTitle: "New Form",
            formDescription: "",
            statementDate: new Date().toISOString().split("T")[0],
            sections: [],
        },
    });

    // Effect to reset the form when initialData changes (e.g., opening a new form or an existing one)
    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        } else {
            form.reset({
                id: formId || uuidv4(), // Use formId if provided for a new form being built based on an ID
                formTitle: "New Form",
                formDescription: "",
                statementDate: new Date().toISOString().split("T")[0],
                sections: [],
            });
        }
    }, [initialData, formId, form.reset]);

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "sections",
    });

    // Define the templates for sections that can be added
    // Ensure the data structure matches the Section type, especially for discriminated unions
    const availableSectionTemplates: Omit<Section, 'id'>[] = [
        { type: "PARTY_DETAILS", title: "Party Details", data: { firstName: "", lastName: "", role: "Applicant" } },
        { type: "INCOME", title: "Income (Weekly)", data: { items: [], notes: "" } },
        { type: "EXPENSES", title: "Expenses (Weekly)", data: { items: [], notes: "" } },
        { type: "ASSETS", title: "Assets (Total Value)", data: { items: [], notes: "" } },
        { type: "LIABILITIES", title: "Liabilities (Total Owed)", data: { items: [], notes: "" } },
        { type: "CUSTOM_TEXT", title: "Notes / Explanations", data: { content: "" } },
    ];
    const [popoverOpen, setPopoverOpen] = useState(false);


    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) {
            return; // Dropped outside the list
        }

        if (source.index === destination.index) {
            return; // Dropped in the same place
        }

        move(source.index, destination.index);
    };

    const addSection = (sectionTemplate: Omit<Section, 'id'>) => {
        // Ensure the appended object matches the Section type precisely
        const newSection: Section = {
            ...sectionTemplate,
            id: uuidv4(),
        } as Section; // Type assertion to satisfy discriminated union
        append(newSection);
        setPopoverOpen(false); // Close popover after adding
        toast.success(`Section "${sectionTemplate.title}" added.`);
    };

    const renderSectionFields = (section: Section, index: number) => {
        switch (section.type) {
            case "PARTY_DETAILS":
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <FormField control={form.control} name={`sections.${index}.data.role`} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Applicant">Applicant</SelectItem>
                                        <SelectItem value="Respondent">Respondent</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name={`sections.${index}.data.firstName`} render={({ field }) => ( <FormItem> <FormLabel>First Name</FormLabel> <FormControl><Input placeholder="First Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                         <FormField control={form.control} name={`sections.${index}.data.lastName`} render={({ field }) => ( <FormItem> <FormLabel>Last Name</FormLabel> <FormControl><Input placeholder="Last Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                );
            case "INCOME":
            case "EXPENSES":
            case "ASSETS":
            case "LIABILITIES":
                return <FinancialListSectionFields control={form.control} sectionIndex={index} sectionType={section.type} />;
            case "CUSTOM_TEXT":
                return (
                    <FormField
                        control={form.control}
                        name={`sections.${index}.data.content`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter your notes or explanations here..." rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
            default:
                return <p>Unknown section type</p>;
        }
    };

    function onSubmit(data: StatementOfMeansData) {
        console.log("Attempting to save form:", JSON.stringify(data, null, 2));
        try {
            const isUpdateOperation = !!(initialData?.id || formId); // Check if it's an update based on initialData.id or formId
            const currentFormId = initialData?.id || formId || data.id || uuidv4(); // Prioritize existing IDs

            const dataToSave: SavedForm = {
                id: currentFormId,
                formTitle: data.formTitle,
                formDescription: data.formDescription,
                statementDate: data.statementDate,
                sections: data.sections,
                // caseId: caseId, // Uncomment if caseId should be part of the SavedForm structure in DB
            };
            
            console.log("Data being passed to putItem:", JSON.stringify(dataToSave, null, 2));
            
            putItem("forms", dataToSave); 
            toast.success(isUpdateOperation ? "Form updated successfully!" : "Form saved successfully!");
            
            if (isUpdateOperation && onFormUpdate) {
                onFormUpdate(dataToSave);
            } else if (!isUpdateOperation && onFormSave) {
                onFormSave(dataToSave);
            } else if (onFormSave) { // Fallback to onFormSave if a more specific handler isn't available/called
                onFormSave(dataToSave);
            }

        } catch (error) {
            console.error("Failed to save/update form:", error);
            toast.error("Failed to save/update form. See console for details.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4 md:p-6">
                {/* Form Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Template Builder</CardTitle>
                         <div className="flex flex-col sm:flex-row sm:items-start gap-4 pt-2">
                         <FormField control={form.control} name="formTitle" render={({ field }) => ( <FormItem className="flex-grow"> <FormLabel>Form Title</FormLabel> <FormControl><Input placeholder="e.g., Client Intake Form" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                         <FormField control={form.control} name="formDescription" render={({ field }) => ( <FormItem className="flex-grow"> <FormLabel>Form Description (Optional)</FormLabel> <FormControl><Input placeholder="A brief description of this form" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                     </div>
                     <FormField control={form.control} name="statementDate" render={({ field }) => ( <FormItem className="pt-2"> <FormLabel>Date</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </CardHeader>
            </Card>

                 <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-700" />
                    <AlertTitle className="text-blue-800">Instructions</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        Build your template by adding sections using the "+ Add Section" button. You can reorder sections by dragging the handle (<GripVertical className="inline h-4 w-4" />) and remove sections using the trash icon (<Trash2 className="inline h-4 w-4 text-red-500" />).
                    </AlertDescription>
                </Alert>

                {/* Add Section Button */}
                 <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Section <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0">
                        <Command>
                            <CommandInput placeholder="Search section type..." />
                            <CommandList>
                                <CommandEmpty>No section type found.</CommandEmpty>
                                <CommandGroup heading="Available Sections">
                                    {availableSectionTemplates.map((secTmpl) => ( // Corrected variable name here
                                        <CommandItem
                                            key={secTmpl.type}
                                            value={secTmpl.title}
                                            onSelect={() => addSection(secTmpl)}
                                        >
                                            {secTmpl.title}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Sections Area (Drag and Drop) */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sections">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-6"
                            >
                                {fields.map((section, index) => (
                                    <Draggable
                                        key={section.id} // Use the unique ID from useFieldArray
                                        draggableId={section.id}
                                        index={index}
                                    >
                                        {(providedDraggable) => (
                                            <Card
                                                ref={providedDraggable.innerRef}
                                                {...providedDraggable.draggableProps}
                                                className="bg-slate-50 overflow-hidden"
                                            >
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 bg-slate-100 border-b">
                                                    <div className="flex items-center gap-2 flex-grow">
                                                        {/* Drag Handle */}
                                                        <span {...providedDraggable.dragHandleProps} className="cursor-grab text-slate-500 hover:text-slate-700">
                                                            <GripVertical className="h-5 w-5" />
                                                        </span>
                                                        {/* Editable Title */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`sections.${index}.title`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex-grow">
                                                                    {/* Hide label visually but keep for accessibility if needed */}
                                                                    {/* <FormLabel className="sr-only">Section Title</FormLabel> */}
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            className="text-base font-semibold border-none focus-visible:ring-1 focus-visible:ring-slate-400 bg-transparent p-1 h-auto"
                                                                            aria-label="Section Title"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    {/* Remove Button */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            remove(index);
                                                            toast.info(`Section "${section.title}" removed.`);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                        aria-label={`Remove ${section.title} section`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-4 md:p-6">
                                                    {renderSectionFields(section as Section, index)}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder} {/* Placeholder for drag-and-drop */}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {fields.length === 0 && (
                     <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-md">
                        No sections added yet. Click "+ Add Section" to begin.
                    </div>
                )}

                <Separator />

                {/* Submission Button */}
                <div className="flex justify-end">
                    <Button type="submit" size="lg">
                        Save Template
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export function StatementOfMeansBuilder() {
    const form = useForm<StatementOfMeansData>({
        resolver: zodResolver(statementOfMeansSchema),
        defaultValues: {
            id: uuidv4(), // Initialize with a UUID
            formTitle: "Statement of Means", // Corrected from statementTitle
            formDescription: "Financial statement for mediation proceedings.",
            statementDate: new Date().toISOString().split("T")[0],
            sections: [], // Start with no sections
        },
    });

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "sections",
    });

    // Define the templates for sections that can be added
    const availableStatementSections: Omit<Section, 'id'>[] = [ // Renamed to avoid conflict
        { type: "PARTY_DETAILS", title: "Party Details", data: { firstName: "", lastName: "", role: "Applicant" } },
        { type: "INCOME", title: "Income (Weekly)", data: { items: [], notes: "" } },
        { type: "EXPENSES", title: "Expenses (Weekly)", data: { items: [], notes: "" } },
        { type: "ASSETS", title: "Assets (Total Value)", data: { items: [], notes: "" } },
        { type: "LIABILITIES", title: "Liabilities (Total Owed)", data: { items: [], notes: "" } },
        { type: "CUSTOM_TEXT", title: "Notes / Explanations", data: { content: "" } },
    ];
    const [popoverOpen, setPopoverOpen] = useState(false);


    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) {
            return; // Dropped outside the list
        }

        if (source.index === destination.index) {
            return; // Dropped in the same place
        }

        move(source.index, destination.index);
    };

    const addSection = (sectionTemplate: Omit<Section, 'id'>) => {
        const newSection: Section = {
            ...sectionTemplate,
            id: uuidv4(),
        } as Section; // Type assertion
        append(newSection);
        setPopoverOpen(false); // Close popover after adding
        toast.success(`Section "${sectionTemplate.title}" added.`);
    };

    const renderSectionFields = (section: Section, index: number) => {
        switch (section.type) {
            case "PARTY_DETAILS":
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <FormField control={form.control} name={`sections.${index}.data.role`} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Applicant">Applicant</SelectItem>
                                        <SelectItem value="Respondent">Respondent</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name={`sections.${index}.data.firstName`} render={({ field }) => ( <FormItem> <FormLabel>First Name</FormLabel> <FormControl><Input placeholder="First Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                         <FormField control={form.control} name={`sections.${index}.data.lastName`} render={({ field }) => ( <FormItem> <FormLabel>Last Name</FormLabel> <FormControl><Input placeholder="Last Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                );
            case "INCOME":
            case "EXPENSES":
            case "ASSETS":
            case "LIABILITIES":
                return <FinancialListSectionFields control={form.control} sectionIndex={index} sectionType={section.type} />;
            case "CUSTOM_TEXT":
                return (
                    <FormField
                        control={form.control}
                        name={`sections.${index}.data.content`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter your notes or explanations here..." rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
            default:
                return <p>Unknown section type</p>;
        }
    };

    function onSubmit(data: StatementOfMeansData) {
        console.log("Statement of Means Submitted:", JSON.stringify(data, null, 2));
        // TODO: Implement saving logic (e.g., API call)
        toast.success("Statement of Means saved successfully (simulated).");
        // You might want to clear the form or redirect after successful submission
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4 md:p-6">
                {/* Form Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Statement of Means Builder</CardTitle>
                         <div className="flex flex-col sm:flex-row sm:items-start gap-4 pt-2">
                             <FormField control={form.control} name="formTitle" render={({ field }) => ( <FormItem className="flex-grow"> <FormLabel>Document Title</FormLabel> <FormControl><Input placeholder="e.g., Statement of Means - [Case Name]" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                             <FormField control={form.control} name="formDescription" render={({ field }) => ( <FormItem className="flex-grow"> <FormLabel>Document Description (Optional)</FormLabel> <FormControl><Input placeholder="A brief description of this statement" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                         </div>
                         <FormField control={form.control} name="statementDate" render={({ field }) => ( <FormItem className="pt-2"> <FormLabel>Date</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </CardHeader>
                </Card>

                 <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-700" />
                    <AlertTitle className="text-blue-800">Instructions</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        Add sections using the "+ Add Section" button. You can reorder sections by dragging the handle (<GripVertical className="inline h-4 w-4" />) and remove sections using the trash icon (<Trash2 className="inline h-4 w-4 text-red-500" />). Remember to fill in weekly amounts for Income/Expenses where applicable.
                    </AlertDescription>
                </Alert>

                {/* Add Section Button */}
                 <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Section <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0">
                        <Command>
                            <CommandInput placeholder="Search section type..." />
                            <CommandList>
                                <CommandEmpty>No section type found.</CommandEmpty>
                                <CommandGroup heading="Available Sections">
                                    {availableStatementSections.map((secTmpl) => { // Changed variable name here
                                        return (
                                            <CommandItem
                                                key={secTmpl.type}
                                                value={secTmpl.title}
                                                onSelect={() => addSection(secTmpl)}
                                            >
                                                {secTmpl.title}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Sections Area (Drag and Drop) */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sections">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-6"
                            >
                                {fields.map((section, index) => (
                                    <Draggable
                                        key={section.id} // Use the unique ID from useFieldArray
                                        draggableId={section.id}
                                        index={index}
                                    >
                                        {(providedDraggable) => (
                                            <Card
                                                ref={providedDraggable.innerRef}
                                                {...providedDraggable.draggableProps}
                                                className="bg-slate-50 overflow-hidden"
                                            >
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 bg-slate-100 border-b">
                                                    <div className="flex items-center gap-2 flex-grow">
                                                        {/* Drag Handle */}
                                                        <span {...providedDraggable.dragHandleProps} className="cursor-grab text-slate-500 hover:text-slate-700">
                                                            <GripVertical className="h-5 w-5" />
                                                        </span>
                                                        {/* Editable Title */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`sections.${index}.title`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex-grow">
                                                                    {/* Hide label visually but keep for accessibility if needed */}
                                                                    {/* <FormLabel className="sr-only">Section Title</FormLabel> */}
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            className="text-base font-semibold border-none focus-visible:ring-1 focus-visible:ring-slate-400 bg-transparent p-1 h-auto"
                                                                            aria-label="Section Title"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    {/* Remove Button */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            remove(index);
                                                            toast.info(`Section "${section.title}" removed.`);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                                        aria-label={`Remove ${section.title} section`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-4 md:p-6">
                                                    {renderSectionFields(section as Section, index)}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder} {/* Placeholder for drag-and-drop */}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {fields.length === 0 && (
                     <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-md">
                        No sections added yet. Click "+ Add Section" to begin.
                    </div>
                )}

                <Separator />

                {/* Submission Button */}
                <div className="flex justify-end">
                    <Button type="submit" size="lg">
                        Save Statement of Means
                    </Button>
                </div>
            </form>
        </Form>
    );
}