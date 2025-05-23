import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Save, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addItem, getAllItems } from "@/services/localDbService";
import { Template, Matter } from "@/types/models";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(3, { message: "Template title must be at least 3 characters." }),
  caseFileNumber: z.string().min(1, { message: "Please select a Case File Number." }),
});

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTemplateDialog({ isOpen, onClose }: CreateTemplateDialogProps) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoadingMatters, setIsLoadingMatters] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      caseFileNumber: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: "",
        caseFileNumber: "",
      });

      const loadMatters = async () => {
        setIsLoadingMatters(true);
        try {
          const loadedMatters = await getAllItems('matters');
          setMatters(loadedMatters);
        } catch (error) {
          console.error('Error loading matters:', error);
          toast({ title: "Error", description: "Failed to load case files.", variant: "destructive" });
        } finally {
          setIsLoadingMatters(false);
        }
      };
      loadMatters();
    }
  }, [isOpen, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const newTemplate: Partial<Template> = {
      id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: data.title,
      caseFileNumber: data.caseFileNumber,
      category: "other",
      description: "",
      content: "",
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await addItem('templates', newTemplate as Template);
      toast({
        title: "Template Link Created",
        description: `Template "${newTemplate.title}" linked to case ${newTemplate.caseFileNumber}.`,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save template link:", error);
      toast({ title: "Error", description: "Failed to save template link. Please try again.", variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg mx-auto w-[calc(100%-2rem)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Link New Template</AlertDialogTitle>
          <AlertDialogDescription>
            Create a title for a new template and link it to a case file.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form id="create-template-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 py-4">

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Initial Offer Letter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caseFileNumber"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Case File Number</FormLabel>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={popoverOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoadingMatters}
                        >
                          {field.value
                            ? matters.find(m => m.caseFileNumber === field.value)?.caseFileNumber
                            : isLoadingMatters ? "Loading cases..." : "Select Case File..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command filter={(value, search) => {
                          const matter = matters.find(m => m.caseFileNumber.toLowerCase() === value.toLowerCase());
                          if (!matter) return 0;
                          const term = search.toLowerCase();
                          if (matter.caseFileNumber.toLowerCase().includes(term)) return 1;
                          if (matter.title.toLowerCase().includes(term)) return 1;
                          return 0;
                        }}>
                        <CommandInput placeholder="Search case number or title..." />
                        <CommandList>
                          <CommandEmpty>{isLoadingMatters ? "Loading..." : "No matching case file found."}</CommandEmpty>
                          <CommandGroup>
                            {matters.map((matter) => (
                              <CommandItem
                                key={matter.id}
                                value={matter.caseFileNumber}
                                onSelect={(currentValue) => {
                                  field.onChange(currentValue === field.value ? "" : currentValue);
                                  setPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === matter.caseFileNumber ? "opacity-100" : "opacity-0"
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
              )}
            />

          </form>
        </Form>

        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <Button type="submit" form="create-template-form" className="gap-2">
             <Save className="h-4 w-4" />
             Save Template Link
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
