import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasksContext } from "@/contexts/TasksContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { ListTodo, CheckCircle2, LayoutList } from "lucide-react";

interface TaskTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const TaskTabs = ({ activeTab, setActiveTab }: TaskTabsProps) => {
  const { tasks } = useTasksContext();
  const isMobile = useIsMobile();
  
  // Calculate counts for each status
  const allCount = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
  const doneCount = tasks.filter(t => t.status === "Done").length;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className={`grid grid-cols-3 ${isMobile ? "w-full text-xs" : "w-full"}`}>
        <TabsTrigger value="all" className="flex items-center gap-1">
          <LayoutList className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          All ({allCount})
        </TabsTrigger>
        <TabsTrigger value="inProgress" className="flex items-center gap-1">
          <ListTodo className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          {isMobile ? "In Prog" : "In Progress"} ({inProgressCount})
        </TabsTrigger>
        <TabsTrigger value="done" className="flex items-center gap-1">
          <CheckCircle2 className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          {isMobile ? "Done" : "Done"} ({doneCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
