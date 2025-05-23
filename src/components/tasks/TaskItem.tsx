import { Briefcase, Calendar, Share2, Download, Trash, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditTaskDialog } from "@/components/dialogs/edit-task-dialog";
import { useTasksContext, Task } from "@/contexts/TasksContext";
import { useIsMobile } from "@/hooks/use-mobile"; // Corrected import path
import { Link } from "react-router-dom"; // Import Link
import { paths } from "@/routes/paths"; // Added import

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const { 
    toggleTaskCompletion, 
    handleDeleteTask, 
    handleShareTask, 
    handleDownloadTask,
    handleSaveTask 
  } = useTasksContext();
  const isMobile = useIsMobile();

  // Format date for display
  const formatDate = (dateInput: Date | string) => { // Accept Date or string
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      month: isMobile ? 'numeric' : 'short',
      day: 'numeric',
      year: isMobile ? '2-digit' : 'numeric',
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-amber-500";
      case "Low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div 
      className={`flex flex-col ${isMobile ? "p-2" : "p-4"} hover:bg-muted/50 transition-colors`}
    >
      {/* Top row: task title, and action buttons */}
      <div className="flex justify-between">
        <div className="flex items-start">
          {/* <Checkbox 
            checked={selectedTasks.includes(task.id)}
            onCheckedChange={() => toggleSelectTask(task.id)}
            className="mr-2 mt-1"
          /> */}
          {/* Removed Checkbox component */}
          <div className="flex items-start ml-0"> {/* Adjusted ml-3 to ml-0 after removing checkbox */}
            <button
              onClick={() => toggleTaskCompletion(task.id)}
              className="flex-shrink-0 mr-2 mt-1" // Added mr-2 and mt-1 for spacing
            >
              <CheckSquare 
                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} ${
                  task.completed ? "text-green-500" : "text-gray-400" // Use completed flag instead of status
                }`} 
              />
            </button>
            <div className="ml-1"> {/* Adjusted ml-3 to ml-1 */}
              <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium ${
                task.completed ? "line-through text-muted-foreground" : "" // Use completed flag instead of status
              }`}>
                {task.title}
              </p>
              {/* Add Link to case summary page below task title */}
              {task.caseId && task.caseFileNumber && (
                <Link 
                  to={`${paths.caseFiles}/${task.caseId}/summary`}
                  className={`block text-blue-600 hover:underline ${isMobile ? "text-[0.65rem]" : "text-xs"}`}
                  title={`View Case Summary for ${task.caseFileNumber} - ${task.caseTitle}`}
                >
                  <Briefcase className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"} inline-block`} /> {task.caseFileNumber}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {isMobile ? (
          <div className="flex items-center space-x-0">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 w-6"
              onClick={() => handleShareTask(task.id)}
              title="Share Task"
            >
              <Share2 className="h-3 w-3" />
            </Button>
            <EditTaskDialog 
              task={task}
              onSave={(updatedTask) => handleSaveTask({
                id: task.id,
                title: updatedTask.title || "",
                caseId: task.caseId, 
                caseFileNumber: task.caseFileNumber, // Ensure caseFileNumber is passed
                caseTitle: updatedTask.caseTitle || "",
                priority: (updatedTask.priority || "Medium") as "Low" | "Medium" | "High", // Cast and provide default
                status: updatedTask.status as "Todo" | "In Progress" | "Done" | "Blocked", // Removed "|| "Pending"" fallback
                dueDate: updatedTask.dueDate ? (typeof updatedTask.dueDate === 'string' ? updatedTask.dueDate : updatedTask.dueDate.toISOString()) : new Date().toISOString() // Ensure string
              })}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6">
                  <Trash className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the task "{task.title}".
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleShareTask(task.id)}
              title="Share Task"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDownloadTask(task.id)}
              title="Download Task"
            >
              <Download className="h-4 w-4" />
            </Button>
            <EditTaskDialog 
              task={task}
              onSave={(updatedTask) => handleSaveTask({
                id: task.id,
                title: updatedTask.title || "",
                caseId: task.caseId, 
                caseFileNumber: task.caseFileNumber, // Ensure caseFileNumber is passed
                caseTitle: updatedTask.caseTitle || "",
                priority: (updatedTask.priority || "Medium") as "Low" | "Medium" | "High", // Cast and provide default
                status: updatedTask.status as "Todo" | "In Progress" | "Done" | "Blocked", // Removed "|| "Pending"" fallback
                dueDate: updatedTask.dueDate ? (typeof updatedTask.dueDate === 'string' ? updatedTask.dueDate : updatedTask.dueDate.toISOString()) : new Date().toISOString() // Ensure string
              })}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the task "{task.title}".
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Metadata row: all information stacked together under the task title */}
      <div className="ml-8 mt-1"> {/* Adjusted to ml-8, may need further refinement based on actual rendering */}
        <div className="flex flex-wrap items-center text-xs text-muted-foreground">
          <div className="flex items-center mr-3">
            <Calendar className={isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"} />
            <span className={isMobile ? "text-[0.65rem]" : "text-xs"}>Due: {formatDate(task.dueDate)}</span> {/* Pass Date directly */}
          </div>
          
          <div className="flex items-center mr-3">
            <span className="mr-1">•</span>
            <span className={`${
              task.status === "Done" // Changed to "Done"
                ? "text-green-500" 
                : task.status === "In Progress" 
                ? "text-blue-500" 
                : "text-amber-500" // Default for "Todo" and "Blocked"
            } ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
              {task.status} {/* Display the actual status */}
            </span>
          </div>
          
          <div className="flex items-center mr-3">
            <span className="mr-1">•</span>
            <Briefcase className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"}`} />
            <span className={isMobile ? "text-[0.65rem]" : "text-xs"}>{task.caseTitle}</span>
          </div>
          
          <div className="flex items-center">
            <span className="mr-1">•</span>
            <span className={`${getPriorityColor(task.priority)} ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
              {task.priority} Priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
