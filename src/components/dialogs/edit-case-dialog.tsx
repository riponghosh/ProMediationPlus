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
import { updateCase } from "@/api/CaseServices";
import { UpdateCasePayload } from "@/api/interface";


// Update schema to use string ID and match Case interface fields
const formSchema = z.object({
  id: z.string(), // Changed to string
  title: z.string().min(2, "Case title is required"),
  type: z.string().optional(), // Make type optional to match CaseType
  status: z.string().min(1, "Status is required"),
  // clientName: z.string().optional(),
  description: z.string().optional(),
  lastUpdated: z.string().optional(), // Keep lastUpdated from the Case object (optional)
  // caseFileNumber: z.string().optional(),
  // caseFileName: z.string().optional(),
  // Do not include fields not edited directly in this form (like intakeForm, participants etc.)
  // unless the dialog is intended to edit them too.
});

export type CaseFormValues = z.infer<typeof formSchema>;

// Props now use the consistent Case interface
interface EditCaseDialogProps {
  caseItem: CaseType; // MODIFIED: Renamed 'case' to 'caseItem' to avoid keyword conflict
  onSave: (updatedCase: CaseType) => void; // MODIFIED: Renamed parameter 'case' to 'updatedCase'
  loadCases: () => void; // Added loadCases to refresh the list after update
}
export function EditCaseDialog({loadCases, caseItem: initialCaseData, onSave }: EditCaseDialogProps) { // MODIFIED: Destructure 'caseItem' and alias to 'initialCaseData'
  const [open, setOpen] = useState(false);

  
  // Initialize form with values from the passed Case prop
  // Ensure only fields defined in formSchema are passed as defaultValues
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialCaseData.id,
      title: initialCaseData.title,
      // type: initialCaseData.type || "", // Handle optional type
      status: initialCaseData.status,
      // clientName: initialCaseData.clientName || "",
      description: initialCaseData.description || "", // Handle optional description
      lastUpdated: initialCaseData.lastUpdated || new Date().toISOString(),
      // caseFileNumber: initialCaseData.caseFileNumber || "",
      // caseFileName: initialCaseData.caseFileName || "",
    },
  });

function onSubmit(formValues: CaseFormValues) {
  // 1. UpdateCasePayload e jodi 'lastUpdated' na thake, tobe eta kete din
  // Sudhu backend e jei field gulo allow kore segulo pathan
  const { id, lastUpdated, ...updatableFields } = formValues; 

  const payload: UpdateCasePayload = {
    ...updatableFields,
    // lastUpdated: new Date().toISOString(), // Jodi interface error dey, eta bad din
  };

  // 2. Promise handling kora jate success/error toast thik moto ase
  updateCase(initialCaseData.id, payload)
    .then((response) => {
      toast.success("Case updated successfully");
      loadCases();
      onSave(response);
      setOpen(false);
      form.reset();
    })
    .catch((error) => {
      console.error("Error updating case:", error);
      // toast.error(error.message || "Failed to update case");
    });
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
            <input type="hidden" {...form.register("clientName")} />
            <input type="hidden" {...form.register("lastUpdated")} />
            <input type="hidden" {...form.register("caseFileNumber")} />
            <input type="hidden" {...form.register("caseFileName")} />
            <FormItem>
              <FormLabel>Case Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter case title" {...form.register("title")} />
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="on-hold">Pending</SelectItem>
                  </SelectContent>
                </Select>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              {/* Submit button e onClick={onSubmit} thakar dorkar nei, 
                  form.handleSubmit(onSubmit) eta handle korbe */}
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
