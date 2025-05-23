import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface Task {
  id: string; // Changed from number to string to align with models.ts
  title: string;
  caseId: string; 
  caseFileNumber: string;
  caseTitle: string;
  status: 'Todo' | 'In Progress' | 'Done' | 'Blocked'; // Aligned with models.ts Task status
  priority: 'Low' | 'Medium' | 'High'; // Aligned with models.ts Task priority
  dueDate: Date; // Changed from string to Date to align with models.ts
  assignedTo?: string; // Aligned with models.ts Task assignedTo
  description?: string; // Aligned with models.ts Task description
  createdAt: Date; // Added createdAt to align with models.ts
  updatedAt: Date; // Added updatedAt to align with models.ts
  completed?: boolean; // Add completed flag for visual state
}

export interface TaskFormValues {
  id: string; // Changed from number to string
  title: string;
  caseId: string; 
  caseFileNumber: string;
  caseTitle: string;
  status: 'Todo' | 'In Progress' | 'Done' | 'Blocked'; // Aligned with models.ts Task status
  priority: 'Low' | 'Medium' | 'High'; // Aligned with models.ts Task priority
  dueDate: string; // Kept as string, as it's often from form input or needs serialization
  assignedTo?: string;
  description?: string;
  createdAt?: Date; // Made optional as it's set on creation
  updatedAt?: Date; // Made optional as it's set on update
}

interface TasksContextType {
  tasks: Task[];
  selectedTasks: string[]; // Changed from number[] to string[]
  toggleTaskCompletion: (id: string) => void; // Changed from number to string
  toggleSelectTask: (id: string) => void; // Changed from number to string
  handleSaveTask: (updatedTaskOrNewTask: TaskFormValues) => void; // Updated to reflect it can be a new task
  handleDeleteTask: (id: string) => void; // Changed from number to string
  handleBulkDelete: () => void;
  handleShareTask: (id: string) => void; // Changed from number to string
  handleDownloadTask: (id: string) => void; // Changed from number to string
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Define the desired order of statuses
const statusOrder: Task['status'][] = ['In Progress', 'Todo', 'Blocked', 'Done'];

// Helper function to sort tasks
const sortTasks = (tasksToSort: Task[]): Task[] => {
  // Ensure we are sorting a copy
  const arrayToSort = [...tasksToSort]; 
  arrayToSort.sort((a, b) => {
    const statusAIndex = statusOrder.indexOf(a.status);
    const statusBIndex = statusOrder.indexOf(b.status);

    if (statusAIndex !== statusBIndex) {
      return statusAIndex - statusBIndex;
    }
    // If statuses are the same, sort by due date (earliest first)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  return arrayToSort; // Return the sorted copy
};


// Initial mock data for tasks
const initialTasks: Task[] = sortTasks([
  {
    id: "1",
    title: "Review settlement agreement",
    caseId: "case-smith-v-johnson-001", 
    caseFileNumber: "CF-2023-001",
    caseTitle: "Smith vs. Johnson",
    status: "In Progress",
    priority: "High",
    dueDate: new Date("2023-06-20"),
    assignedTo: "Mediator",
    description: "Review the draft settlement agreement and provide feedback",
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2023-06-01"),
  },
  {
    id: "2",
    title: "Schedule follow-up meeting",
    caseId: "case-smith-v-johnson-001", 
    caseFileNumber: "CF-2023-001",
    caseTitle: "Smith vs. Johnson",
    status: "Todo", // Changed from Pending to Todo
    priority: "Medium",
    dueDate: new Date("2023-06-18"),
    assignedTo: "Mediator",
    description: "Set up a follow-up meeting with all parties",
    createdAt: new Date("2023-06-02"),
    updatedAt: new Date("2023-06-02"),
  },
  {
    id: "3",
    title: "Request additional financial documents",
    caseId: "case-smith-v-johnson-001",
    caseFileNumber: "CF-2023-001", 
    caseTitle: "Smith vs. Johnson",
    status: "Done", // Changed from Completed to Done
    priority: "Medium",
    dueDate: new Date("2023-06-05"),
    assignedTo: "Mediator",
    description: "Contact client for additional financial statements",
    createdAt: new Date("2023-05-20"),
    updatedAt: new Date("2023-06-05"),
  },
  {
    id: "4",
    title: "Review historical survey records",
    caseId: "case-property-dispute-002", 
    caseFileNumber: "CF-2023-002", 
    caseTitle: "Property Dispute Resolution",
    status: "In Progress",
    priority: "Medium",
    dueDate: new Date("2023-06-22"),
    assignedTo: "Mediator",
    description: "Analyze historical property surveys",
    createdAt: new Date("2023-06-10"),
    updatedAt: new Date("2023-06-15"),
  },
  {
    id: "5",
    title: "Draft boundary agreement",
    caseId: "case-property-dispute-002", 
    caseFileNumber: "CF-2023-002", 
    caseTitle: "Property Dispute Resolution",
    status: "Todo", // Changed from Pending to Todo
    priority: "High",
    dueDate: new Date("2023-06-25"),
    assignedTo: "Mediator",
    description: "Prepare initial draft of boundary agreement",
    createdAt: new Date("2023-06-12"),
    updatedAt: new Date("2023-06-12"),
  },
  {
    id: "6",
    title: "Request employee performance records",
    caseId: "case-brown-employment-003", 
    caseFileNumber: "CF-2024-001", 
    caseTitle: "Brown Employment Dispute",
    status: "Todo", // Changed from Pending to Todo
    priority: "Medium",
    dueDate: new Date("2023-06-18"),
    assignedTo: "Mediator",
    description: "Obtain employee performance records from HR",
    createdAt: new Date("2023-06-10"),
    updatedAt: new Date("2023-06-10"),
  },
  {
    id: "7",
    title: "Schedule initial meeting",
    caseId: "case-brown-employment-003", 
    caseFileNumber: "CF-2024-001", 
    caseTitle: "Brown Employment Dispute",
    status: "Done", // Changed from Completed to Done
    priority: "High",
    dueDate: new Date("2023-06-10"),
    assignedTo: "Mediator",
    description: "Set up initial consultation with both parties",
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2023-06-10"),
  },
  {
    id: "8",
    title: "Review company policies",
    caseId: "case-brown-employment-003", 
    caseFileNumber: "CF-2024-001", 
    caseTitle: "Brown Employment Dispute",
    status: "In Progress",
    priority: "Low",
    dueDate: new Date("2023-06-15"),
    assignedTo: "Mediator",
    description: "Review company policies relevant to the dispute",
    createdAt: new Date("2023-06-05"),
    updatedAt: new Date("2023-06-10"),
  },
  {
    id: "9",
    title: "Draft agenda for first session",
    caseId: "case-brown-employment-003", 
    caseFileNumber: "CF-2024-001", 
    caseTitle: "Brown Employment Dispute",
    status: "In Progress",
    priority: "Medium",
    dueDate: new Date("2023-06-12"),
    assignedTo: "Mediator",
    description: "Create detailed agenda for first mediation session",
    createdAt: new Date("2023-06-08"),
    updatedAt: new Date("2023-06-10"),
  },
  {
    id: "10",
    title: "Contact third party witnesses",
    caseId: "case-brown-employment-003", 
    caseFileNumber: "CF-2024-001", 
    caseTitle: "Brown Employment Dispute",
    status: "Todo", // Changed from Pending to Todo
    priority: "Low",
    dueDate: new Date("2023-06-20"),
    assignedTo: "Mediator",
    description: "Reach out to potential witnesses",
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2023-06-15"),
  },
]);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks); // Already sorted
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]); // Changed from number[]

  // Toggle task completion (visual only - doesn't change status)
  const toggleTaskCompletion = async (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const newCompletedStatus = !task.completed;
          const newStatus = newCompletedStatus ? 'Done' : 'In Progress';
          return {
            ...task,
            completed: newCompletedStatus,
            status: newStatus,
            updatedAt: new Date(), // Update timestamp locally
          };
        }
        return task;
      })
    );
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() } // Update timestamp locally
          : task
      )
    );
  };

  // Toggle task selection
  const toggleSelectTask = (id: string) => { // Changed from number
    setSelectedTasks(prev => 
      prev.includes(id) 
        ? prev.filter(taskId => taskId !== id) 
        : [...prev, id]
    );
  };

  // Handle saving edited task or adding a new task
  const handleSaveTask = (taskData: TaskFormValues) => {
    setTasks(prevTasks => {
      const existingTaskIndex = prevTasks.findIndex(task => task.id === taskData.id);
      let newTasks = [...prevTasks];
      if (existingTaskIndex !== -1) {
        // Update existing task
        newTasks[existingTaskIndex] = {
          ...prevTasks[existingTaskIndex],
          ...taskData,
          dueDate: new Date(taskData.dueDate), // Ensure dueDate is a Date object
          updatedAt: new Date(),
          // Ensure createdAt is preserved if it exists, or set if not (though it should exist for updates)
          createdAt: prevTasks[existingTaskIndex].createdAt || new Date(), 
        };
        toast.success("Task updated successfully");
      } else {
        // Add new task
        newTasks.push({
          ...taskData,
          id: taskData.id || Math.random().toString(36).substr(2, 9), // Ensure ID if not provided
          dueDate: new Date(taskData.dueDate), // Ensure dueDate is a Date object
          createdAt: taskData.createdAt || new Date(), // Add createdAt
          updatedAt: taskData.updatedAt || new Date(), // Add updatedAt
        });
        toast.success("Task created successfully");
      }
      return sortTasks(newTasks); // Re-sort after save
    });
  };

  // Handle deleting task
  const handleDeleteTask = (id: string) => { // Changed from number
    setTasks(prev => {
      const updatedTasks = prev.filter(task => task.id !== id);
      setSelectedTasks(sel => sel.filter(taskId => taskId !== id));
      toast.success("Task deleted successfully");
      return sortTasks(updatedTasks); // Re-sort after delete - though not strictly necessary as order won't change
    });
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setTasks(prev => {
      const updatedTasks = prev.filter(task => !selectedTasks.includes(task.id));
      toast.success(`${selectedTasks.length} tasks deleted`);
      setSelectedTasks([]);
      return sortTasks(updatedTasks); // Re-sort after bulk delete
    });
  };

  // Handle sharing task
  const handleShareTask = (id: string) => { // Changed from number
    const task = tasks.find(t => t.id === id);
    if (task) {
      toast.success(`Shared task: ${task.title}`);
    }
  };

  // Handle downloading task
  const handleDownloadTask = (id: string) => { // Changed from number
    const task = tasks.find(t => t.id === id);
    if (task) {
      // In a real app, would create a file for download
      const taskData = JSON.stringify(task, null, 2);
      const blob = new Blob([taskData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${task.title.replace(/\s+/g, '_')}_task.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded task: ${task.title}`);
    }
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        selectedTasks,
        toggleTaskCompletion,
        toggleSelectTask,
        handleSaveTask,
        handleDeleteTask,
        handleBulkDelete,
        handleShareTask,
        handleDownloadTask
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};
