import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
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

// Define a schema for contact form validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is required"),
  company: z.string().optional(),
  type: z.string().min(1, "Contact type is required"),
  caseFileNumbers: z.array(z.string()).optional(),
});

// Infer the type from the zod schema
export type ContactFormValues = z.infer<typeof formSchema>;

// Define props for the CreateContactDialog component
interface CreateContactDialogProps {
  onCreateContact: (contact: any) => void;
}

export function CreateContactDialog({ onCreateContact }: CreateContactDialogProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile(); // Add the mobile check
  
  // Initialize react-hook-form with zod validation
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      type: "Client",
    },
  });

  // Handle form submission
  function onSubmit(values: ContactFormValues) {
    // Create a new contact with a generated UUID
    const newContact = {
      id: crypto.randomUUID(), // Generate a proper UUID string
      ...values,
    };
    
    // Pass the new contact to the parent component
    onCreateContact(newContact);
    
    // Show success toast
    toast.success("Contact created successfully");
    
    // Reset form and close dialog
    form.reset();
    setOpen(false);
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
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Company</FormLabel>
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caseFileNumbers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case File Numbers</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter case file numbers, comma separated"
                      {...field}
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? value.split(',').map(s => s.trim()) : []);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Create Contact</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
