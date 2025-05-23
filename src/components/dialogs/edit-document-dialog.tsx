
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Upload, Share, Download, Trash } from "lucide-react";
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
  id: z.number(),
  name: z.string().min(2, "Document name is required"),
  type: z.string().min(1, "Document type is required"),
  caseFileNumber: z.string().min(1, "Related Case File Number is required"), // Updated from matter
  file: z.string().optional(),
  size: z.string().optional(),
  createdAt: z.string().optional(),
  owner: z.string().optional(),
});

export type DocumentFormValues = z.infer<typeof formSchema>;

export interface EditDocumentDialogProps {
  document: DocumentFormValues;
  onSave: (document: DocumentFormValues) => void;
  onDelete?: (id: number) => void;
}

export function EditDocumentDialog({ document, onSave, onDelete }: EditDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: document,
  });

  function onSubmit(values: DocumentFormValues) {
    // Save the updated document
    onSave(values);
    
    // Show success toast
    toast.success("Document updated successfully");
    
    // Close dialog
    setOpen(false);
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`Shared document: ${document.name}`);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`Downloaded document: ${document.name}`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(document.id);
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
                This will permanently delete the document "{document.name}".
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
          <DialogTitle>Edit Document</DialogTitle>
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
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">Word Document</SelectItem>
                      <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                      <SelectItem value="txt">Text Document</SelectItem>
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
                  <FormLabel>Replace File</FormLabel>
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
