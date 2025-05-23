
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Document name is required"),
  type: z.string().min(1, "Document type is required"),
  caseFileNumber: z.string().min(1, "Related Case File Number is required"), // Updated from matter
  file: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateDocumentDialog() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "Word Document",
      caseFileNumber: "", // Updated from matter
      file: "",
    },
  });

  function onSubmit(values: FormValues) {
    // Here you would typically save the document to your backend
    console.log("Creating document:", values);
    
    // Show success toast
    toast.success("Document uploaded successfully");
    
    // Reset form and close dialog
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Settlement Agreement" {...field} />
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
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Word Document">Word Document</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Excel Spreadsheet">Excel Spreadsheet</SelectItem>
                      <SelectItem value="Text Document">Text Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caseFileNumber" // Updated from matter
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Case File Number</FormLabel> {/* Updated label */}
                  <FormControl>
                    <Input placeholder="Enter case file number (e.g., CF-2023-001)" {...field} /> {/* Updated placeholder */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload File</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center gap-2 border-dashed"
                      >
                        <Upload className="h-5 w-5" />
                        <span className="text-xs">Click to upload or drag and drop</span>
                      </Button>
                      <Input 
                        id="file" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            field.onChange(e.target.files[0].name);
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Upload Document</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
