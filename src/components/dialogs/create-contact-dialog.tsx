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
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllCaseFileNumbers } from "@/services/localDbService"; 
import { Contact } from "@/types/models";

// Updated schema: uses firstName, lastName, and linkedCaseFileNumber
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z.string().min(7, "Phone number is required"),
  company: z.string().optional(),
  type: z.string().min(1, "Contact type is required"),
  linkedCaseFileNumber: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof formSchema>;

interface CreateContactDialogProps {
  onCreateContact: (contact: Contact) => void; 
}

export function CreateContactDialog({ onCreateContact }: CreateContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [caseFileNumbers, setCaseFileNumbers] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      type: "Client",
      linkedCaseFileNumber: undefined,
    },
  });

  useEffect(() => {
    if (open) {
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
    }
  }, [open]);

  // Handle form submission
  async function onSubmit(values: ContactFormValues) {
    try {
      const newContact: Contact = {
        id: crypto.randomUUID(),
        // Construct name from firstName and lastName for the Contact model if it still expects 'name'
        // However, the Contact model in models.ts now expects firstName and lastName directly.
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || "",
        phone: values.phone,
        company: values.company || "",
        type: values.type,
        linkedCaseFileNumber: values.linkedCaseFileNumber === "__NONE__" ? undefined : values.linkedCaseFileNumber,
        createdAt: new Date().toISOString(), // Ensure string format
        updatedAt: new Date().toISOString(), // Ensure string format
      };
      
      onCreateContact(newContact);
      toast.success(`Contact for ${values.firstName} ${values.lastName} created successfully.`);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={isMobile ? "sm" : "default"} className="flex items-center gap-2 self-start">
          <Plus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          {isMobile ? "Add" : "Add Contact"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new contact. You can optionally link this contact to an existing case.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name" {...field} value={field.value || ""} />
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
                  <FormLabel>Contact Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="New Enquiry">New Enquiry</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="Solicitor">Solicitor</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Witness">Witness</SelectItem>
                      <SelectItem value="Opposing Party">Opposing Party</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedCaseFileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Case (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a case to link" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__NONE__">None</SelectItem> {/* Option for no selection */}
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

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Contact"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
