import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Clock, Plus, Calendar, MessageSquare, FileText, CheckSquare, User, AlertTriangle } from "lucide-react";
import { getItem, addTimelineEvent, getTimelineForCase } from "@/services/localDbService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Case as CaseModel, TimelineEvent } from "@/types/models";

const TimelinePage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const [currentCase, setCurrentCase] = useState<CaseModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<TimelineEvent, 'id' | 'caseId' | 'createdAt' | 'updatedAt'>>({
    type: "meeting",
    title: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadCaseDetailsAndTimeline = async () => {
      if (!caseId) {
        setError("No case ID provided.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const caseData = await getItem('cases', caseId);
        if (caseData) {
          setCurrentCase(caseData as CaseModel);
          setError(null);

          const events = await getTimelineForCase(caseId);
          setTimelineEvents(events);

        } else {
          setError("Case not found.");
          setCurrentCase(null);
          setTimelineEvents([]);
        }
      } catch (e) {
        console.error("Error loading case data or timeline:", e);
        setError("Failed to load case data or timeline.");
        setCurrentCase(null);
        setTimelineEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCaseDetailsAndTimeline();
  }, [caseId]);

  const handleAddEvent = async () => {
    if (!caseId) {
      toast.error("Cannot add event: Case ID is missing.");
      return;
    }
    if (!newEvent.title.trim()) {
      toast.error("Event title cannot be empty.");
      return;
    }
    if (!newEvent.date) {
      toast.error("Event date must be selected.");
      return;
    }

    const eventToAdd: TimelineEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      caseId: caseId,
      ...newEvent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await addTimelineEvent(eventToAdd);
      setTimelineEvents(prev => [...prev, eventToAdd].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime() || 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      ));
      
      setNewEvent({
        type: "meeting",
        title: "",
        date: new Date().toISOString().split('T')[0],
        description: ""
      });
      setIsNewEventDialogOpen(false);
      toast.success("Event added to timeline");
    } catch (e) {
      console.error("Failed to add timeline event:", e);
      toast.error("Failed to save event. Please try again.");
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "meeting":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "document":
      case "form":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "task":
        return <CheckSquare className="h-5 w-5 text-purple-500" />;
      case "clientDetails":
        return <User className="h-5 w-5 text-orange-500" />;
      case "deadline":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return <Layout><div className="p-4 md:p-6">Loading timeline...</div></Layout>;
  }

  if (error || !currentCase) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold mb-2`}>{error || "Case Not Found"}</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or couldn't be loaded.</p>
          <Button size={isMobile ? "sm" : "default"} asChild>
            <Link to="/case-files">Back to Case Files</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";
  const timelineIconSizeClass = isMobile ? "h-4 w-4" : "h-5 w-5";

  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} p-4 md:p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/case-files">
                <ChevronLeft className={iconSizeClass} />
              </Link>
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Timeline</h1>
              <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                {currentCase.title} • {currentCase.caseFileNumber || currentCase.id}
              </div>
            </div>
          </div>
          <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
            <DialogTrigger asChild>
              <Button size={isMobile ? "sm" : "default"}>
                <Plus className={`${iconSizeClass} mr-1.5`} />
                {isMobile ? "Add" : "Add Event"}
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? "max-w-[95vw] p-4" : "sm:max-w-[525px]"}>
              <DialogHeader>
                <DialogTitle className={isMobile ? "text-base" : ""}>Add Timeline Event</DialogTitle>
                <DialogDescription>
                  Add a new event to the case timeline
                </DialogDescription>
              </DialogHeader>
              
              <div className={`grid ${isMobile ? "gap-3 py-3" : "gap-4 py-4"}`}>
                <div className="grid gap-1.5">
                  <Label htmlFor="eventType" className={isMobile ? "text-xs" : ""}>Event Type</Label>
                  <Select 
                    value={newEvent.type} 
                    onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="form">Form Activity</SelectItem>
                      <SelectItem value="clientDetails">Client Details Update</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="title" className={isMobile ? "text-xs" : ""}>Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="E.g., Initial Consultation"
                    className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="date" className={isMobile ? "text-xs" : ""}>Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}
                  />
                </div>
                
                <div className="grid gap-1.5">
                  <Label htmlFor="description" className={isMobile ? "text-xs" : ""}>Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly describe this event..."
                    className={`min-h-[${isMobile ? "60px" : "80px"}] ${isMobile ? "text-xs" : "text-sm"}`}
                  />
                </div>
              </div>
              
              <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
                <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setIsNewEventDialogOpen(false)}>Cancel</Button>
                <Button size={isMobile ? "sm" : "default"} onClick={handleAddEvent}>Add to Timeline</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className={isMobile ? "p-4" : ""}>
            <CardTitle className={`flex items-center ${isMobile ? "text-base" : ""}`}>
              <Clock className={`${timelineIconSizeClass} mr-2`} />
              Case Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "p-4 pt-0" : ""}>
            <div className={`relative ${isMobile ? "pl-6" : "pl-8"} border-l-2 border-border ${isMobile ? "space-y-6" : "space-y-8"} py-2`}>
              {timelineEvents.map((event: TimelineEvent) => (
                <div key={event.id} className="relative">
                  <div className={`absolute ${isMobile ? "-left-[20px]" : "-left-[25px]"} p-1 rounded-full bg-background border-2 border-border`}>
                    {isMobile ? (
                      <div className="h-4 w-4 flex items-center justify-center">
                        {getEventIcon(event.type)} 
                      </div>
                    ) : (
                      getEventIcon(event.type)
                    )}
                  </div>
                  
                  <div className={`bg-muted/40 rounded-lg ${isMobile ? "p-3" : "p-4"} hover:shadow-sm transition-shadow`}>
                    <div className={`${isMobile ? "text-xs" : "text-sm"} font-normal text-muted-foreground`}>
                      {formatDate(event.date)}
                      {event.createdAt && (
                        <span className="ml-2 text-gray-400 text-[10px]">
                          (Added: {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      )}
                    </div>
                    <h3 className={`${isMobile ? "text-sm" : "text-lg"} font-semibold mt-1`}>{event.title}</h3>
                    {event.description && <p className={`${isMobile ? "text-xs" : "text-sm"} mt-1`}>{event.description}</p>}
                  </div>
                </div>
              ))}
              
              {timelineEvents.length > 0 && (
                <div className={`absolute top-0 ${isMobile ? "-left-[5px] h-3 w-3" : "-left-[7px] h-4 w-4"} rounded-full bg-primary`}></div>
              )}
              
              <div className={`absolute bottom-0 ${isMobile ? "-left-[5px] h-3 w-3" : "-left-[7px] h-4 w-4"} rounded-full bg-destructive`}></div>
            </div>
            
            {timelineEvents.length === 0 && (
              <div className={`text-center ${isMobile ? "p-4" : "p-6"}`}>
                <p className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>No timeline events yet</p>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "default"}
                  className="mt-2"
                  onClick={() => setIsNewEventDialogOpen(true)}
                >
                  <Plus className={`${iconSizeClass} mr-1.5`} />
                  Add First Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TimelinePage;