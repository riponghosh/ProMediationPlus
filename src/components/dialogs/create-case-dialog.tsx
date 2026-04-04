import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCase } from "@/api/CaseServices";

const formSchema = z.object({
  title: z.string().min(2, "Case title is required"),
  type: z.string().min(1, "Case type is required"),
  clientName: z.string().min(2, "Client name is required"),
  caseFile: z.string()
    .min(9, "Case file must be in format CF-XXXXXX")
    .regex(/^CF-\d{6}$/, "Must be in format CF-XXXXXX"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCaseDialogProps {
  // onSave should only pass the data collected by the form
  onSave?: (caseData: FormValues) => void;
  // External control props
  isOpen?: boolean;
  onClose?: () => void;
  // Control whether to show the trigger button
  showTrigger?: boolean;
}

export function CreateCaseDialog({ onSave, isOpen, onClose, showTrigger = false }: CreateCaseDialogProps) {
  // Use local state for internal control
  const [localOpen, setLocalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use external state if provided, otherwise use local state
  const dialogOpen = isOpen !== undefined ? isOpen : localOpen;
  
  const handleOpenChange = (open: boolean) => {
    if (isOpen !== undefined && onClose && !open) {
      // If external control is used, call onClose when dialog is closing
      onClose();
    } else {
      // Otherwise use local state control
      setLocalOpen(open);
    }
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "Divorce Mediation",
      clientName: "",
      caseFile: "CF-",
    },
  });

async function onSubmit(values: FormValues) {
  try {
    setLoading(true);

    const payload = {
      title: values.title,
      caseFileNumber: values.caseFile,
      type: values.type,
      clientName: values.clientName,
      description: "",
      parties: [values.clientName], // optional for now
      email: "",
      phone: "",
      address: "",
      intakeForm: {},
      caseFileName: values.caseFile,
    };

    const res = await createCase(payload);

    toast.success("Case created successfully");

    if (onSave) {
      onSave(values);
    }

    form.reset();
    handleOpenChange(false);

  } catch (error: any) {
    console.error(error);
    toast.error(error?.message || "Failed to create case");
  } finally {
    setLoading(false);
  }
}

  // Content of the dialog
  const dialogContent = (
    <DialogContent 
      className="sm:max-w-[425px] mx-auto w-[calc(100%-2rem)]"
      onOpenAutoFocus={(event) => event.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Create New Case</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Title</FormLabel>
                <FormControl>
                  <Input placeholder="Smith vs. Johnson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Divorce Mediation">Divorce Mediation</SelectItem>
                    <SelectItem value="Property Dispute">Property Dispute</SelectItem>
                    <SelectItem value="Employment">Employment</SelectItem>
                    <SelectItem value="Family Dispute">Family Dispute</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="caseFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case File Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="CF-XXXXXX" 
                    {...field} 
                    onChange={(e) => {
                      // Ensure the input always starts with CF-
                      if (!e.target.value.startsWith('CF-')) {
                        e.target.value = 'CF-' + e.target.value.replace('CF-', '');
                      }
                      // Limit to CF- plus 6 digits
                      const regex = /^CF-\d{0,6}$/;
                      if (regex.test(e.target.value) || e.target.value === 'CF-') {
                        field.onChange(e);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>Format: CF-XXXXXX (where X is a number)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Case"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  // Conditionally render with or without trigger button
  return showTrigger ? (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  ) : (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
