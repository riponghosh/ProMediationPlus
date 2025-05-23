
import { FileText, ArrowRight, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

// Mock data for recent documents
const recentDocuments = [
  {
    id: 1,
    title: "Settlement Agreement - Smith",
    type: "PDF",
    date: "2023-06-10",
    size: "1.2 MB",
    case: "Smith vs. Johnson",
  },
  {
    id: 2,
    title: "Property Division Document",
    type: "DOCX",
    date: "2023-06-08",
    size: "0.8 MB",
    case: "Property Dispute",
  },
  {
    id: 3,
    title: "Employment Contract",
    type: "PDF",
    date: "2023-06-05",
    size: "0.5 MB",
    case: "Employment Contract",
  },
];

// Helper function to get the appropriate icon based on file type
const getFileIcon = (type: string) => {
  switch (type) {
    case "PDF":
      return <FileText className="h-10 w-10 text-red-500" />;
    case "DOCX":
      return <FileText className="h-10 w-10 text-blue-500" />;
    default:
      return <File className="h-10 w-10 text-gray-500" />;
  }
};

export function RecentDocuments() {
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>
            Recently accessed documents and files
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentDocuments.map((doc) => (
            <div key={doc.id} className="flex items-start space-x-4">
              {getFileIcon(doc.type)}
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.case}</p>
                <div className="flex items-center text-xs text-muted-foreground space-x-2">
                  <span>{formatDate(doc.date)}</span>
                  <span>•</span>
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" asChild>
          <Link to="/storage" className="flex items-center justify-center">
            View All Documents
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
