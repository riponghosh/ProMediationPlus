
import { Layout } from "@/components/layout/layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { 
  MessageSquare, 
  Plus,
  Search,
  Calendar,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Mock data for meeting notes
const meetingNotes = [
  {
    id: 1,
    title: "Initial Consultation",
    caseTitle: "Smith vs. Johnson",
    date: "2023-05-15T10:00:00",
    content: "Both parties expressed their concerns and goals for the mediation process. John wants to maintain significant time with children and is concerned about financial stability. Sarah wants to ensure stability for the children and fair division of assets. Both agree that mediation is preferable to litigation. Next steps: request financial disclosures from both parties and schedule individual sessions to discuss concerns in more detail.",
    attendees: ["John Smith", "Sarah Johnson", "Mediator"]
  },
  {
    id: 2,
    title: "Property Division Discussion",
    caseTitle: "Smith vs. Johnson",
    date: "2023-05-30T14:00:00",
    content: "Discussed options for dividing shared property, including the family home. John indicated he would be willing to let Sarah keep the home if he receives other assets of comparable value. Sarah expressed interest in staying in the home to maintain stability for children. Reviewed financial statements and identified additional documentation needed. Next steps: obtain professional appraisal of home and pension values.",
    attendees: ["John Smith", "Sarah Johnson", "Mediator", "Financial Advisor"]
  },
  {
    id: 3,
    title: "Initial Discussion",
    caseTitle: "Property Dispute Resolution",
    date: "2023-06-01T11:00:00",
    content: "Parties presented their understanding of the property boundaries based on their respective deeds. Michael believes the boundary extends to the large oak tree, while Jennifer maintains it follows the line of the old fence. Reviewed historical property documents but found inconsistencies. Next steps: engage professional surveyor to evaluate property lines based on official records.",
    attendees: ["Michael Brown", "Jennifer Davis", "Mediator"]
  },
  {
    id: 4,
    title: "Initial Negotiation",
    caseTitle: "Corporate Contract Negotiation",
    date: "2023-05-22T09:00:00",
    content: "Discussed key terms of the service contract. ABC Corp outlined their service offerings and delivery timeline. XYZ Inc presented their requirements and quality standards. Identified areas of agreement and points requiring further negotiation. Next steps: ABC to provide detailed service specifications and XYZ to clarify performance metrics.",
    attendees: ["ABC Corp Representative", "XYZ Inc Representative", "Legal Counsel", "Mediator"]
  },
  {
    id: 5,
    title: "Price and Timeline",
    caseTitle: "Corporate Contract Negotiation",
    date: "2023-05-29T10:30:00",
    content: "Negotiated pricing structure and project timeline. ABC proposed a tiered pricing model based on service levels. XYZ requested firm deadlines with penalties for delays. Reached preliminary agreement on base pricing with performance bonuses. Timeline established with key milestones. Next steps: draft contract with agreed terms for review.",
    attendees: ["ABC Corp Representative", "XYZ Inc Representative", "Legal Counsel", "Mediator"]
  },
  {
    id: 6,
    title: "Final Agreement",
    caseTitle: "Corporate Contract Negotiation",
    date: "2023-06-05T13:00:00",
    content: "Review of final contract terms and signature process. All parties agreed to the final version of the contract with minor adjustments to the payment schedule. Discussed implementation plan and communication protocols. Contract signed by authorized representatives of both companies. Next steps: schedule kickoff meeting for project team.",
    attendees: ["ABC Corp CEO", "XYZ Inc Director", "Legal Counsel", "Mediator"]
  },
  {
    id: 7,
    title: "Implementation Planning",
    caseTitle: "Corporate Contract Negotiation",
    date: "2023-06-10T15:00:00",
    content: "Discussed implementation timeline and next steps following contract signing. Established project teams and identified key contacts for both organizations. Reviewed communication channels and reporting structure. Created risk management plan and escalation procedures. Next steps: weekly status meetings beginning next Monday.",
    attendees: ["ABC Corp Project Manager", "XYZ Inc Operations Manager", "Mediator"]
  },
  {
    id: 8,
    title: "Pre-mediation Call",
    caseTitle: "Brown Employment Dispute",
    date: "2023-06-02T14:00:00",
    content: "Preliminary discussion with both parties to explain the mediation process. James expressed concerns about workplace treatment and performance evaluations. HR Director outlined company policies and previous attempts to address concerns. Department Manager provided context about team dynamics and performance standards. All parties agreed to a structured mediation approach. Next steps: individual sessions with each party to discuss specific concerns.",
    attendees: ["James Brown", "HR Director", "Department Manager", "Mediator"]
  },
];

// Function to group notes by case
const groupNotesByCase = (notes: typeof meetingNotes) => {
  const grouped: Record<string, typeof meetingNotes> = {};
  
  notes.forEach(note => {
    if (!grouped[note.caseTitle]) {
      grouped[note.caseTitle] = [];
    }
    grouped[note.caseTitle].push(note);
  });
  
  return grouped;
};

const MeetingNotesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter notes based on search query
  const filteredNotes = meetingNotes.filter(
    note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const groupedNotes = groupNotesByCase(filteredNotes);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meeting Notes</h1>
            <p className="text-muted-foreground">
              Document and review notes from mediation sessions.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Meeting Note
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search meeting notes..."
            className="w-full bg-background py-2 pl-8 pr-4 text-sm border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {Object.keys(groupedNotes).length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedNotes).map(([caseTitle, notes]) => (
              <AccordionItem key={caseTitle} value={caseTitle}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{caseTitle}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({notes.length} {notes.length === 1 ? 'note' : 'notes'})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 mt-2">
                    {notes.map((note) => (
                      <Card key={note.id} className="hover:bg-muted/50 cursor-pointer transition-colors">
                        <CardHeader>
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                          <CardDescription className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(note.date)} at {formatTime(note.date)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">Attendees:</h4>
                            <div className="flex flex-wrap gap-1">
                              {note.attendees.map((attendee, index) => (
                                <span 
                                  key={index} 
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted"
                                >
                                  {attendee}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{note.content}</p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="ghost" className="ml-auto" size="sm">
                            <span>View Full Note</span>
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No meeting notes found matching your search.</p>
              <Button variant="outline" className="mt-2">Create a new meeting note</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MeetingNotesPage;
