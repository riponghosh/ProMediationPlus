import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { TasksProvider, useTasksContext } from "@/contexts/TasksContext";
import { CheckSquare2, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Dashboard version of Weekly Tasks Summary component
const WeeklyTasksSummaryContent = () => {
  const { tasks } = useTasksContext();
  const isMobile = useIsMobile();
  
  // Limit to 5 tasks for dashboard
  const filteredTasks = tasks.slice(0, 5);

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    
    // Check if date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Weekly Tasks Summary</CardTitle>
          <CardDescription>Your upcoming and recent tasks</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mb-4">
          {/* Task list */}
          <div className="flex flex-col divide-y">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div key={task.id} className="py-2 flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 ${
                      task.status === "Completed" ? "text-green-500" : 
                      task.status === "In Progress" ? "text-blue-500" : 
                      "text-amber-500"
                    }`}>
                      <CheckSquare2 className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                    </div>
                    <div>
                      <p className={`${isMobile ? "text-sm" : ""} font-medium ${
                        task.status === "Completed" ? "line-through text-muted-foreground" : ""
                      }`}>
                        {task.title}
                      </p>
                      <div className={`flex items-center ${isMobile ? "text-xs" : "text-sm"} text-muted-foreground gap-2`}>
                        <span>{task.caseTitle}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDueDate(task.dueDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    task.priority === "High" ? "bg-red-100 text-red-700" : 
                    task.priority === "Medium" ? "bg-amber-100 text-amber-700" : 
                    "bg-green-100 text-green-700"
                  }`}>
                    {task.priority}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No tasks found.</p>
              </div>
            )}
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link to="/tasks" className="flex items-center justify-center">
            View All Tasks
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

// Export the component with TasksProvider wrapper
export function WeeklyTasksSummary() {
  return (
    <TasksProvider>
      <WeeklyTasksSummaryContent />
    </TasksProvider>
  );
}