import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasksContext } from "@/contexts/TasksContext";
import { Case } from "@/types/models";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  caseId: z.string().nonempty("Case selection is required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  status: z.string().default("In Progress"),
  assignedTo: z.string().default("Mediator"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const { tasks, handleSaveTask } = useTasksContext();
  
  const uniqueCases: Pick<Case, 'id' | 'caseFileNumber' | 'title'>[] = Array.from(
    new Map(
      tasks.map(task => [
        task.caseId, 
        { id: task.caseId, caseFileNumber: task.caseFileNumber, title: task.caseTitle }
      ])
    ).values()
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      caseId: "",
      priority: "Medium",
      status: "In Progress",
      assignedTo: "Mediator",
      description: "",
    },
  });

  function onSubmit(values: FormValues) {
    const numericTaskIds = tasks.map(task => typeof task.id === 'number' ? task.id : parseInt(task.id as string, 10)).filter(id => !isNaN(id));
    const nextId = numericTaskIds.length > 0 ? Math.max(0, ...numericTaskIds) + 1 : 1;
    
    const selectedCase = uniqueCases.find(m => m.id === values.caseId);

    if (!selectedCase) {
      toast.error("Selected case not found. Please try again.");
      return;
    }

    const newTask = {
      id: nextId.toString(),
      title: values.title,
      caseId: selectedCase.id,
      caseFileNumber: selectedCase.caseFileNumber,
      caseTitle: selectedCase.title,
      priority: values.priority as "Low" | "Medium" | "High",
      status: values.status as 'Todo' | 'In Progress' | 'Done' | 'Blocked',
      dueDate: values.dueDate,
      assignedTo: values.assignedTo,
      description: values.description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    handleSaveTask({
      ...newTask,
      dueDate: values.dueDate.toISOString(),
    });
    
    toast.success("Task created successfully");
    
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <span className="mr-2">+</span>
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Case</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select related case" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {uniqueCases.map((caseItem) => (
                        <SelectItem key={caseItem.id} value={caseItem.id}>
                          {caseItem.caseFileNumber} - {caseItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Todo">To Do</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTaskDialog;
