import React, { useState, useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Phone, Video, Users, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, { message: "Session title is required" }),
  date: z.date({
    required_error: "Session date is required",
  }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:mm)" }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:mm)" }),
  sessionType: z.enum(["Phone Call", "Video Call", "Meeting"], {
    required_error: "Session type is required",
  }),
  notes: z.string().optional(),
});

interface CreateSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  onAddSession: (session: z.infer<typeof formSchema>) => void;
}

export function CreateSessionDialog({ isOpen, onClose, initialDate, onAddSession }: CreateSessionDialogProps) {
  const isMobile = useIsMobile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: initialDate || new Date(),
      startTime: "09:00",
      endTime: "10:00",
      sessionType: "Meeting",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: "",
        date: initialDate || new Date(),
        startTime: "09:00",
        endTime: "10:00",
        sessionType: "Meeting",
        notes: "",
      });
    }
  }, [isOpen, initialDate, form]);

  const getSessionTypeIcon = (type: z.infer<typeof formSchema>['sessionType']) => {
    switch (type) {
      case "Phone Call": return <Phone className="h-4 w-4 text-blue-500" />;
      case "Video Call": return <Video className="h-4 w-4 text-purple-500" />;
      case "Meeting": return <Users className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form data submitted from dialog:", data);
    // Validate end time is after start time
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    const startDate = new Date(data.date);
    startDate.setHours(startHour, startMinute);
    const endDate = new Date(data.date);
    endDate.setHours(endHour, endMinute);

    if (endDate <= startDate) {
      form.setError("endTime", {
        type: "manual",
        message: "End time must be after start time",
      });
      return;
    }

    try {
      // Pass only the required fields and notes
      onAddSession({
        title: data.title,
        date: data.date, // Pass Date object
        startTime: data.startTime,
        endTime: data.endTime,
        sessionType: data.sessionType,
        notes: data.notes,
      });
      toast({
        title: "Session scheduled",
        description: `${data.title} (${data.sessionType}) scheduled for ${format(data.date, "PPP")}`,
      });
      onClose();
    } catch (error) {
      console.error("Failed to add session:", error);
      toast({
        title: "Error",
        description: "Failed to schedule session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter session title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type">
                          {field.value && (
                            <div className="flex items-center gap-2">
                              {getSessionTypeIcon(field.value)}
                              <span>{field.value}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Phone Call">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span>Phone Call</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Video Call">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-purple-500" />
                          <span>Video Call</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Meeting">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span>Meeting</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter notes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Schedule Session</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
