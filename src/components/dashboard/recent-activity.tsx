import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Mail, Phone, Users } from "lucide-react";

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: "document",
    title: "Agreement to Mediate signed",
    case: "Smith v. Jones",
    time: "2 hours ago",
    icon: FileText,
  },
  {
    id: 2,
    type: "communication",
    title: "Email sent to client",
    case: "Johnson Divorce",
    time: "Yesterday",
    icon: Mail,
  },
  {
    id: 3,
    type: "meeting",
    title: "Initial consultation",
    case: "ABC Corp v. XYZ Inc",
    time: "2 days ago",
    icon: Users,
  },
  {
    id: 4,
    type: "call",
    title: "Call with attorney",
    case: "Estate of Williams",
    time: "3 days ago",
    icon: Phone,
  },
  {
    id: 5,
    type: "calendar",
    title: "Mediation scheduled",
    case: "Brown Family Trust",
    time: "1 week ago",
    icon: Calendar,
  },
];

// Activity type to badge color mapping
const getActivityColor = (type: string) => {
  switch (type) {
    case "document":
      return "bg-blue-100 text-blue-800";
    case "communication":
      return "bg-green-100 text-green-800";
    case "meeting":
      return "bg-purple-100 text-purple-800";
    case "call":
      return "bg-yellow-100 text-yellow-800";
    case "calendar":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const RecentActivity = () => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className={isMobile ? "text-base" : ""}>Recent Activity</CardTitle>
          <CardDescription className={isMobile ? "text-xs" : ""}>Latest updates and interactions</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className={`flex items-start gap-3 ${isMobile ? "py-2" : ""}`}>
                <div className={`mt-0.5 rounded-full p-1.5 bg-muted flex items-center justify-center ${
                  isMobile ? "p-1" : "p-1.5"
                }`}>
                  <Icon className={isMobile ? "h-3 w-3" : "w-4 h-4"} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`${isMobile ? "text-sm" : ""} font-medium`}>{activity.title}</p>
                    <Badge 
                      variant="outline" 
                      className={`${getActivityColor(activity.type)} ${
                        isMobile ? "text-[10px] px-1.5 py-0.5" : ""
                      }`}
                    >
                      {activity.type}
                    </Badge>
                  </div>
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                    {activity.case} • {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};