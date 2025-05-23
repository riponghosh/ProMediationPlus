
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight, Calendar, CheckSquare, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: "meeting",
    title: "Meeting with Smith family",
    date: "2023-06-15T10:00:00",
    description: "Initial consultation for custody mediation",
    icon: <Calendar className="h-8 w-8 text-blue-500" />,
    link: "/calendar"
  },
  {
    id: 2,
    type: "task",
    title: "Prepare settlement agreement draft",
    date: "2023-06-14T14:30:00",
    description: "For Johnson property dispute case",
    icon: <CheckSquare className="h-8 w-8 text-green-500" />,
    link: "/tasks"
  },
  {
    id: 3,
    type: "note",
    title: "Updated notes on Wilson case",
    date: "2023-06-13T09:00:00",
    description: "Added discussion points from last session",
    icon: <FileText className="h-8 w-8 text-amber-500" />,
    link: "/notes"
  },
  {
    id: 4,
    type: "meeting_note",
    title: "Corporate contract negotiations",
    date: "2023-06-12T13:00:00",
    description: "Meeting notes from the session with both parties",
    icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
    link: "/meeting-notes"
  },
];

const ActivitiesPage = () => {
  // Format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Format time from date string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Recent activities and interactions related to your cases.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Your recent activities across all mediation cases
                </CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex">
                  <div className="mr-4 flex items-start">{activity.icon}</div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.date)} at {formatTime(activity.date)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="pt-2">
                      <Button variant="link" className="h-auto p-0" asChild>
                        <Link to={activity.link} className="flex items-center text-sm">
                          View Details
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ActivitiesPage;
