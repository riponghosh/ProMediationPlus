
import { useState, useRef, useEffect } from "react"; // Added useRef, useEffect
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Share, Download, Trash, X, Check, ChevronsUpDown } from "lucide-react"; // Added X, Check, ChevronsUpDown
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"; // Added Command
import { Badge } from "@/components/ui/badge"; // Added Badge
import { cn } from "@/lib/utils"; // Added cn
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  id: z.string(), // Changed ID to string
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is required"),
  company: z.string().optional(),
  type: z.string().min(1, "Contact type is required"),
  // Allow CF followed by alphanumeric and hyphens
  caseFileNumbers: z.array(z.string().regex(/^CF[\w-]+$/, "Case file number must start with 'CF' and contain numbers, letters, or hyphens")).optional(),
});

export type ContactFormValues = z.infer<typeof formSchema>;

interface EditContactDialogProps {
  contact: ContactFormValues;
  availableCaseFileNumbers: string[]; // Add prop for autocomplete suggestions
  onUpdateContact: (contact: ContactFormValues) => void;
  onDelete?: (id: string) => void; // Changed ID to string
}

export function EditContactDialog({ contact, availableCaseFileNumbers, onUpdateContact, onDelete }: EditContactDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: contact,
  });

  function onSubmit(values: ContactFormValues) {
    // Save the updated contact
    onUpdateContact(values);
    
    // Show success toast
    toast.success("Contact updated successfully");
    
    // Close dialog
    setOpen(false);
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`Shared contact: ${contact.name}`);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`Downloaded contact: ${contact.name}`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(contact.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={handleShare} title="Share">
          <Share className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
          <Download className="h-4 w-4" />
        </Button>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive" title="Delete">
              <Trash className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the contact "{contact.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
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
                const selectedValues = field.value || [];
                const [popoverOpen, setPopoverOpen] = useState(false);
                const [inputValue, setInputValue] = useState(''); // For CommandInput

                const handleSelect = (currentValue: string) => {
                  const newValue = currentValue.toLowerCase();
                  const exists = selectedValues.some(v => v.toLowerCase() === newValue);
                  if (!exists) {
                    // Validate format before adding
                    // Use the updated, more flexible regex
                    if (/^CF[\w-]+$/i.test(currentValue)) {
                      field.onChange([...selectedValues, currentValue]);
                    } else {
                      toast.warning(`Invalid format: ${currentValue}. Must be CF followed by numbers.`);
                    }
                  }
                  setInputValue(''); // Clear input after selection/attempt
                  setPopoverOpen(false);
                };

                const handleRemove = (valueToRemove: string) => {
                  field.onChange(selectedValues.filter(v => v !== valueToRemove));
                };

                const filteredSuggestions = availableCaseFileNumbers.filter(
                  cfn => !selectedValues.includes(cfn) && cfn.toLowerCase().includes(inputValue.toLowerCase())
                );

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Case File Numbers</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={popoverOpen}
                            className={cn(
                              "w-full justify-between",
                              !field.value?.length && "text-muted-foreground"
                            )}
                          >
                            {selectedValues.length > 0
                              ? `${selectedValues.length} selected`
                              : "Select case file numbers..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command shouldFilter={false}> {/* We filter manually */}
                          <CommandInput
                            placeholder="Search or type number..."
                            value={inputValue}
                            onValueChange={setInputValue}
                            onKeyDown={(e) => {
                              // Allow adding custom value if Enter is pressed and it's valid
                              if (e.key === 'Enter' && inputValue && !filteredSuggestions.includes(inputValue)) {
                                e.preventDefault();
                                handleSelect(inputValue);
                              }
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>No matching numbers found.</CommandEmpty>
                            <CommandGroup>
                              {filteredSuggestions.map((cfn) => (
                                <CommandItem
                                  key={cfn}
                                  value={cfn}
                                  onSelect={() => handleSelect(cfn)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedValues.includes(cfn) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {cfn}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedValues.map((value) => (
                        <Badge key={value} variant="secondary">
                          {value}
                          <button
                            type="button"
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={() => handleRemove(value)}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
