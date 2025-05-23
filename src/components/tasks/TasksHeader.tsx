import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreateTaskDialog } from "@/components/dialogs/create-task-dialog";
import { useTasksContext } from "@/contexts/TasksContext";
import { useIsMobile } from "@/hooks/use-mobile";

export const TasksHeader = () => {
  const { selectedTasks, handleBulkDelete } = useTasksContext();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
      <div>
        <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Tasks</h1>
        <p className="text-muted-foreground text-sm">
          Manage and track tasks for your mediation cases.
        </p>
      </div>
      <div className="flex gap-2 self-start">
        {selectedTasks.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size={isMobile ? "sm" : "default"}>
                <Trash className={`mr-2 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                {isMobile ? "Delete" : "Delete Selected"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the selected tasks.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <CreateTaskDialog />
      </div>
    </div>
  );
};
