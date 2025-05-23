
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for recent notes
const recentNotes = [
  {
    id: 1,
    title: "Initial Consultation Notes",
    case: "Smith vs. Johnson",
    date: "2023-06-10T15:30:00",
    excerpt: "Parties expressed willingness to discuss settlement terms...",
  },
  {
    id: 2,
    title: "Property Valuation Discussion",
    case: "Property Dispute",
    date: "2023-06-09T11:00:00",
    excerpt: "Both parties agreed to obtain independent property valuations...",
  },
  {
    id: 3,
    title: "Settlement Agreement Draft",
    case: "Employment Contract",
    date: "2023-06-07T09:45:00",
    excerpt: "Key terms of the settlement agreement were outlined...",
  },
];

export function RecentNotes() {
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
        <CardDescription>Your latest mediation notes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="grid gap-1">
                  <div className="font-medium">{note.title}</div>
                  <div className="text-sm text-muted-foreground">{note.case}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(note.date)}</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {note.excerpt}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to="/notes" className="flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            <span>View All Notes</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
