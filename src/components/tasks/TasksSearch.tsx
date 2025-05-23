import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface TasksSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TasksSearch = ({ searchQuery, setSearchQuery }: TasksSearchProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4">
      <div className="relative flex-1">
        <Search className={`absolute left-2.5 top-${isMobile ? '2' : '2.5'} ${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
        <input
          type="text"
          placeholder="Search tasks..."
          className={`w-full bg-background ${isMobile ? 'py-1.5 text-xs' : 'py-2 text-sm'} pl-8 pr-4 border rounded-md`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex gap-2 w-full md:w-auto">
        <Filter className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
        Filter
      </Button>
    </div>
  );
};
