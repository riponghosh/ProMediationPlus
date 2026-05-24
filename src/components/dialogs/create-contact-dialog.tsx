import { useEffect, useState } from "react";
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
import { FileText, Save, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getCases } from "@/api/CaseServices";

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isMobile = useIsMobile(); // Add the mobile check
  
  const [isLoadingMatters, setIsLoadingMatters] = useState(true);
  const [matters, setMatters] = useState<any[]>([]);
  
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

  useEffect(() => {
    if (open) {
      setPopoverOpen(false);
      const loadMatters = async () => {
        setIsLoadingMatters(true);
        try {
          const loadedMatters = await getCases();
          setMatters(loadedMatters.data || []);
        } catch (error) {
          console.error('Error loading matters:', error);
          toast("Failed to load case files for selection");
        } finally {
          setIsLoadingMatters(false);
        }
      };
      loadMatters();
      form.reset();
    } else {
      // Reset when dialog closes
      setPopoverOpen(false);
    }
  }, [open, form]);

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
              render={({ field }) => {
                const selectedValue = field.value?.[0] || "";

                return (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel>Case File Number</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between text-left font-normal",
                              !selectedValue && "text-muted-foreground"
                            )}
                            disabled={isLoadingMatters}
                          >
                            {selectedValue
                              ? matters.find((m) => m.caseFileNumber === selectedValue)?.caseFileNumber
                              : "Select Case File..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command
                          filter={(value, search) => {
                            const matter = matters.find(
                              (m) => m.caseFileNumber.toLowerCase() === value.toLowerCase()
                            );
                            if (!matter) return 0;
                            const term = search.toLowerCase();
                            if (matter.caseFileNumber.toLowerCase().includes(term)) return 1;
                            if (matter.title.toLowerCase().includes(term)) return 1;
                            return 0;
                          }}
                        >
                          <CommandInput placeholder="Search case number or title..." />
                          <CommandList>
                            <CommandEmpty>
                              {isLoadingMatters ? "Loading cases..." : "No matching case file found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {matters.map((matter) => (
                                <CommandItem
                                  key={matter.id}
                                  value={matter.caseFileNumber}
                                  onSelect={() => {
                                    field.onChange([matter.caseFileNumber]);
                                    setPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedValue === matter.caseFileNumber ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <div className="font-medium">{matter.caseFileNumber}</div>
                                    <div className="text-xs text-muted-foreground">{matter.title}</div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
