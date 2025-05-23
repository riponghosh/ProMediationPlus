import { Layout } from "@/components/layout/layout";
import { useState, useEffect } from "react";
import { getAllItems } from "@/services/localDbService";
import type { Matter } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Plus, Clock, Filter } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Mock data for notes
const initialNotes = [
  {
    id: 1,
    title: "Initial Consultation Notes",
    case: "Smith vs. Johnson",
    caseFileNumber: "CF-2023-001",
    date: "2023-06-10T15:30:00",
    category: "consultation",
    excerpt: "Parties expressed willingness to discuss settlement terms. Key issues include property division and custody arrangements. Follow-up scheduled for next week.",
  },
  {
    id: 2,
    title: "Property Valuation Discussion",
    case: "Property Dispute",
    caseFileNumber: "CF-2023-002",
    date: "2023-06-09T11:00:00",
    category: "mediation",
    excerpt: "Both parties agreed to obtain independent property valuations. Will reconvene after appraisals are complete. Tension seems to be decreasing as we focus on factual matters.",
  },
  {
    id: 3,
    title: "Settlement Agreement Draft",
    case: "Employment Contract",
    caseFileNumber: "CF-2023-003",
    date: "2023-06-07T09:45:00",
    category: "agreement",
    excerpt: "Key terms of the settlement agreement were outlined. Employee to receive severance package and letter of recommendation. Employer to withdraw performance concerns from file.",
  },
  {
    id: 4,
    title: "Follow-up Mediation Session",
    case: "Smith vs. Johnson",
    caseFileNumber: "CF-2023-001",
    date: "2023-06-05T13:00:00",
    category: "mediation",
    excerpt: "Made progress on several key issues. Parties agreed to temporary arrangements while working toward final agreement. Next session scheduled for June 20.",
  },
  {
    id: 5,
    title: "Pre-Mediation Interview",
    case: "Business Partnership Dissolution",
    caseFileNumber: "CF-2023-004",
    date: "2023-06-01T10:30:00",
    category: "consultation",
    excerpt: "Met separately with each partner to understand concerns and goals. Both indicate willingness to negotiate fair division of assets and ongoing projects.",
  },
];

const NotesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
  const [allNotes, setAllNotes] = useState(initialNotes);
  const [matters, setMatters] = useState<Matter[]>([]);

  useEffect(() => {
    const loadMatters = async () => {
      try {
        const loadedMatters = await getAllItems('matters');
        setMatters(loadedMatters);
      } catch (error) {
        console.error("Failed to load matters", error);
      }
    };
    loadMatters();
  }, []);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for new or updated note data from location state
  useEffect(() => {
    if (location.state) {
      const { newNote, updatedNote } = location.state;
      
      if (newNote) {
        // Add the new note to the notes array
        setAllNotes(prev => [newNote, ...prev]);
        
        // Show a toast notification
        toast({
          title: "Note created",
          description: `"${newNote.title}" has been added to your notes`,
        });
      }
      
      if (updatedNote) {
        // Update the existing note in the array
        setAllNotes(prev => 
          prev.map(note => note.id === updatedNote.id ? updatedNote : note)
        );
        
        // Show a toast notification
        toast({
          title: "Note updated",
          description: `"${updatedNote.title}" has been updated`,
        });
      }
      
      // Clear the location state to prevent duplicate additions
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Handle note click to navigate to edit page
  const handleNoteClick = (note: any) => {
    navigate("/notes/new", { 
      state: { note }
    });
  };

  // Filter notes based on search term and category
  const filteredNotes = allNotes.filter(note => {
    const matchesSearch = searchTerm === "" || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.case.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = currentCategory === "all" || note.category === currentCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Function to render the note card
  const renderNoteCard = (note: any) => (
    <div
      key={note.id}
      className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => handleNoteClick(note)}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-mediator-500" />
            <span className="font-medium">{note.title}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Case: {note.case}
          </div>
        </div>
        <div className="flex items-center text-xs text-muted-foreground gap-2 flex-wrap">
          <Clock className="h-3 w-3" />
          <span>{formatDate(note.date)}</span>
          {note.caseFileNumber && (() => {
            const matter = matters.find(m => m.caseFileNumber === note.caseFileNumber);
            return matter ? (
              <>
                <span>•</span>
                <Link
                  to={`/case-files/${matter.id}`}
                  className="text-blue-600 hover:underline font-mono"
                  title={`View Case File ${note.caseFileNumber}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {note.caseFileNumber}
                </Link>
              </>
            ) : null;
          })()}
        </div>
      </div>
      <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {note.excerpt}
      </div>
    </div>
  );

  // Function to render empty state
  const renderEmptyState = (category = "") => (
    <div className="text-center py-10 text-muted-foreground">
      <FileText className="mx-auto h-10 w-10 mb-2" />
      <h3 className="font-medium">
        No {category ? `${category} ` : ""}notes found
      </h3>
      <p className="text-sm mt-1">
        {searchTerm 
          ? "Try adjusting your search term." 
          : `Start by creating your first${category ? ` ${category}` : ""} note.`}
      </p>
      {!searchTerm && (
        <Button className="mt-4" asChild>
          <Link to="/notes/new">
            <Plus className="mr-2 h-4 w-4" />
            Create{category ? ` ${category}` : ""} Note
          </Link>
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">
              Create, view, and manage your mediation notes.
            </p>
          </div>
          <Button asChild className="flex gap-2">
            <Link to="/notes/new">
              <Plus className="h-4 w-4" />
              New Note
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>My Notes</CardTitle>
                <CardDescription>Browse and search your notes</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notes..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={currentCategory} onValueChange={setCurrentCategory}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All Notes</TabsTrigger>
                  <TabsTrigger value="consultation">Consultations</TabsTrigger>
                  <TabsTrigger value="mediation">Mediation</TabsTrigger>
                  <TabsTrigger value="agreement">Agreements</TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" className="flex gap-1 text-xs">
                  <Filter className="h-3 w-3" />
                  <span>Filter</span>
                </Button>
              </div>
              
              <TabsContent value="all" className="mt-4">
                <div className="space-y-4">
                  {filteredNotes.length > 0 
                    ? filteredNotes.map(renderNoteCard)
                    : renderEmptyState()
                  }
                </div>
              </TabsContent>
              
              <TabsContent value="consultation" className="mt-4">
                <div className="space-y-4">
                  {filteredNotes.length > 0 
                    ? filteredNotes.map(renderNoteCard)
                    : renderEmptyState("consultation")
                  }
                </div>
              </TabsContent>
              
              <TabsContent value="mediation" className="mt-4">
                <div className="space-y-4">
                  {filteredNotes.length > 0 
                    ? filteredNotes.map(renderNoteCard)
                    : renderEmptyState("mediation")
                  }
                </div>
              </TabsContent>
              
              <TabsContent value="agreement" className="mt-4">
                <div className="space-y-4">
                  {filteredNotes.length > 0 
                    ? filteredNotes.map(renderNoteCard)
                    : renderEmptyState("agreement")
                  }
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NotesPage;
