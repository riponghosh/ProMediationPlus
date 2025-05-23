import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Case as CaseType } from "@/types/models"; // Import Case as CaseType

// Define Case interface consistent with other components
// Ideally, move this to a shared types file (e.g., src/types/case.ts)
// interface Case {
//   id: string;
//   title: string;
//   type: string;
//   status: string;
//   lastUpdated: string;
//   clientName: string;
//   description?: string; // Make optional consistent with schema
//   caseFileNumber: string;
//   caseFileName: string;
//   // Add other fields from the shared definition if needed by the form
//   participants?: string[];
//   documents?: any[];
//   tasks?: any[];
//   meetingNotes?: any[];
//   nextSession?: any | null;
//   intakeForm?: any;
// }

// Update schema to use string ID and match Case interface fields
const formSchema = z.object({
  id: z.string(), // Changed to string
  title: z.string().min(2, "Case title is required"),
  type: z.string().optional(), // Make type optional to match CaseType
  status: z.string().min(1, "Status is required"),
  clientName: z.string().min(2, "Client name is required"),
  description: z.string().optional(),
  lastUpdated: z.string(), // Keep lastUpdated from the Case object
  caseFileNumber: z.string().min(1, "Case file number is required"),
  caseFileName: z.string().min(1, "Case file name is required"),
  // Do not include fields not edited directly in this form (like intakeForm, participants etc.)
  // unless the dialog is intended to edit them too.
});

export type CaseFormValues = z.infer<typeof formSchema>;

// Props now use the consistent Case interface
interface EditCaseDialogProps {
  caseItem: CaseType; // MODIFIED: Renamed 'case' to 'caseItem' to avoid keyword conflict
  onSave: (updatedCase: CaseType) => void; // MODIFIED: Renamed parameter 'case' to 'updatedCase'
}
export function EditCaseDialog({ caseItem: initialCaseData, onSave }: EditCaseDialogProps) { // MODIFIED: Destructure 'caseItem' and alias to 'initialCaseData'
  const [open, setOpen] = useState(false);

  
  // Initialize form with values from the passed Case prop
  // Ensure only fields defined in formSchema are passed as defaultValues
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialCaseData.id,
      title: initialCaseData.title,
      type: initialCaseData.type || "", // Handle optional type
      status: initialCaseData.status,
      clientName: initialCaseData.clientName,
      description: initialCaseData.description || "", // Handle optional description
      lastUpdated: initialCaseData.lastUpdated,
      caseFileNumber: initialCaseData.caseFileNumber,
      caseFileName: initialCaseData.caseFileName,
    },
  });

  function onSubmit(formValues: CaseFormValues) {
    // Merge form values with the original case data to preserve fields not in the form
    const updatedCaseData: CaseType = { // MODIFIED: Renamed 'updatedCase' to 'updatedCaseData' to avoid conflict with parameter
      ...initialCaseData, // Start with original data (derived from caseItem prop)
      ...formValues,       // Overwrite with form values
      lastUpdated: new Date().toISOString() // Update timestamp (use full ISO string)
    };

    // Save the complete updated case object
    onSave(updatedCaseData); // MODIFIED: Pass 'updatedCaseData'
    form.reset(); // Reset the form fields
    setOpen(false); // Close the dialog
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="mr-2">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Case</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <input type="hidden" {...form.register("id")} />
            <FormItem>
              <FormLabel>Case Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter case title" {...form.register("title")} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => form.setValue("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type1">Type 1</SelectItem>
                    <SelectItem value="type2">Type 2</SelectItem>
                    <SelectItem value="type3">Type 3</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select onValueChange={(value) => form.setValue("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter client name" {...form.register("clientName")} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter case description" {...form.register("description")} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Case File Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter case file number" {...form.register("caseFileNumber")} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Case File Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter case file name" {...form.register("caseFileName")} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
