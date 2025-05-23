import { Layout } from "@/components/layout/layout";
import { UpcomingMediations } from "@/components/dashboard/upcoming-mediations";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { WeeklyTasksSummary } from "@/components/dashboard/weekly-tasks-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckSquare, Info, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Dashboard</h1>
            <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
              Welcome to Andrew Rooney Legal management platform.
            </p>
          </div>
        </div>
        
        <div className={`grid gap-${isMobile ? "4" : "6"} md:grid-cols-2`}>
          <QuickActions />
          <UpcomingMediations />
        </div>
        
        <div className={`grid gap-${isMobile ? "4" : "6"} md:grid-cols-2`}>
          <RecentActivity />
          <WeeklyTasksSummary />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;