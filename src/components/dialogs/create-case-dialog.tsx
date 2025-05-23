import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateNextCaseFileIdForCase } from "@/services/localDbService";

const formSchema = z.object({
  title: z.string().min(2, "Case title is required"),
  type: z.string().min(1, "Case type is required"),
  clientName: z.string().min(2, "Client name is required"),
  caseFile: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCaseDialogProps {
  onSave?: (caseData: FormValues) => void;
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export function CreateCaseDialog({ onSave, isOpen, onClose, showTrigger = false }: CreateCaseDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [generatedCaseFileId, setGeneratedCaseFileId] = useState<string>("");

  const dialogOpen = isOpen !== undefined ? isOpen : localOpen;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "Divorce Mediation",
      clientName: "",
      caseFile: "",
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      const generateId = async () => {
        try {
          const newId = await generateNextCaseFileIdForCase();
          setGeneratedCaseFileId(newId);
          form.setValue("caseFile", newId);
        } catch (error) {
          console.error("Failed to generate case file ID:", error);
          toast.error("Failed to generate case file ID.");
        }
      };
      generateId();
    } else {
      form.reset({
        title: "",
        type: "Divorce Mediation",
        clientName: "",
        caseFile: "",
      });
      setGeneratedCaseFileId("");
    }
  }, [dialogOpen, form]);

  const handleOpenChange = (open: boolean) => {
    if (isOpen !== undefined && onClose && !open) {
      onClose();
    } else {
      setLocalOpen(open);
    }
  };

  function onSubmit(values: FormValues) {
    if (onSave) {
      onSave(values);
    } else {
      toast.success(`Case ${values.caseFile} created successfully`);
    }
    form.reset();
    handleOpenChange(false);
  }

  const dialogContent = (
    <DialogContent 
      className="sm:max-w-[425px] mx-auto w-[calc(100%-2rem)]"
      onOpenAutoFocus={(event) => event.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Create New Case</DialogTitle>
        <DialogDescription>
          Fill in the details below to create a new case. The case file number will be automatically generated.
        </DialogDescription>
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
                    {...field} 
                    readOnly 
                    value={generatedCaseFileId || "Generating..."}
                    className="border-dashed bg-muted text-muted-foreground"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Case</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

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
