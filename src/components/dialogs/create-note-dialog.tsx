import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FileText, Save, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Matter, Note } from "@/types/models";
import { getAllItems, addItem } from "@/services/localDbService";

interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateNoteDialog({ isOpen, onClose }: CreateNoteDialogProps) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoadingMatters, setIsLoadingMatters] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    caseFileNumber: "",
    content: ""
  });

  useEffect(() => {
    if (isOpen) {
      const loadMatters = async () => {
        setIsLoadingMatters(true);
        try {
          const loadedMatters = await getAllItems('matters');
          setMatters(loadedMatters);
        } catch (error) {
          console.error('Error loading matters:', error);
          toast({ title: "Error", description: "Failed to load case files for selection.", variant: "destructive" });
        } finally {
          setIsLoadingMatters(false);
        }
      };
      loadMatters();
      setFormData({ title: "", caseFileNumber: "", content: "" });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCaseFileSelect = (value: string) => {
    setFormData(prev => ({ ...prev, caseFileNumber: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.title.trim()) {
      toast({ title: "Required field missing", description: "Please enter a title for your note", variant: "destructive" });
      return;
    }
    if (!formData.caseFileNumber) {
      toast({ title: "Required field missing", description: "Please select a Case File Number", variant: "destructive" });
      return;
    }

    const noteData: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: formData.title.trim(),
      caseFileNumber: formData.caseFileNumber,
      content: formData.content.trim(),
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await addItem('notes', noteData);
      toast({
        title: "Note created",
        description: `"${noteData.title}" has been added to your notes.`,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({ title: "Error", description: "Failed to save note. Please try again.", variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg mx-auto w-[calc(100%-2rem)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Note</AlertDialogTitle>
        </AlertDialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter note title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Case File Number</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !formData.caseFileNumber && "text-muted-foreground"
                  )}
                  disabled={isLoadingMatters}
                >
                  {formData.caseFileNumber
                    ? matters.find(m => m.caseFileNumber === formData.caseFileNumber)?.caseFileNumber
                    : "Select Case File..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
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
                    <CommandEmpty>{isLoadingMatters ? "Loading cases..." : "No matching case file found."}</CommandEmpty>
                    <CommandGroup>
                      {matters.map((matter) => (
                        <CommandItem
                          key={matter.id}
                          value={matter.caseFileNumber}
                          onSelect={() => {
                            handleCaseFileSelect(matter.caseFileNumber);
                            document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.caseFileNumber === matter.caseFileNumber ? "opacity-100" : "opacity-0"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Note Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter note content"
              value={formData.content}
              onChange={handleChange}
              className="min-h-[150px]"
            />
          </div>
        </form>
        
        <AlertDialogFooter className="pt-4">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <Button onClick={() => handleSubmit()} className="gap-2">
             <Save className="h-4 w-4" />
             Save Note
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
