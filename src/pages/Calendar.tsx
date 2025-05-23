import { Layout } from "@/components/layout/layout";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { CreateSessionDialog } from "@/components/dialogs/create-session-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import '../styles/calendar.css'; // Import custom calendar styles
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  date: string; // ISO string (YYYY-MM-DD) for all-day events, or ISO datetime string for timed events
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  notes?: string;
  sessionType: "Phone Call" | "Video Call" | "Meeting";
}

interface FullCalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601 date or datetime string
  end: string; // ISO 8601 date or datetime string
  extendedProps?: {
    location?: string;
    notes?: string;
    sessionType: Session['sessionType'];
  };
  color?: string; // Optional: for styling based on session type
}

const CalendarPage = () => {
  const isMobile = useIsMobile();
  const currentDate = new Date();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(currentDate);
  const [currentViewDate, setCurrentViewDate] = useState<Date>(currentDate);
  const [isEventDetailsDialogOpen, setIsEventDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FullCalendarEvent | null>(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState(!isMobile);
  const calendarRef = useRef<any>(null);

  // Toggle weekly summary visibility when screen size changes
  useEffect(() => {
    setShowWeeklySummary(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    // Load sessions from localStorage on mount
    const storedSessions = localStorage.getItem("sessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  useEffect(() => {
    // Save sessions to localStorage whenever sessions state changes
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  const handleAddSession = useCallback((newSessionData: Omit<Session, 'id'> & { date: Date }) => {
    const sessionWithId: Session = {
      ...newSessionData,
      id: crypto.randomUUID(),
      date: newSessionData.date.toISOString().split('T')[0], // Convert Date object to YYYY-MM-DD string
    };
    setSessions(prev => [...prev, sessionWithId]);
    setIsCreateSessionDialogOpen(false); // Close dialog after adding
  }, [setSessions]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setIsCreateSessionDialogOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
    setIsEventDetailsDialogOpen(true);
  };

  const handleEventDrop = (dropInfo: any) => {
    // Update session date/time in state and local storage
    const updatedSessions = sessions.map(session => {
      if (session.id === dropInfo.event.id) {
        const newStartDate = dropInfo.event.start;
        const newEndDate = dropInfo.event.end;
        return {
          ...session,
          date: format(newStartDate, 'yyyy-MM-dd'),
          startTime: format(newStartDate, 'HH:mm'),
          endTime: newEndDate ? format(newEndDate, 'HH:mm') : session.endTime,
        };
      }
      return session;
    });
    setSessions(updatedSessions);
  };

  const handleEventReceive = (info: any) => {
    // This is for drag and drop from external sources, not needed for now
    console.log('eventReceive', info);
  };

  const events: FullCalendarEvent[] = sessions.map(session => {
    const startDateTime = `${session.date}T${session.startTime}:00`;
    const endDateTime = `${session.date}T${session.endTime}:00`;

    let color;
    switch (session.sessionType) {
      case "Phone Call": color = '#3b82f6'; break; // blue-500
      case "Video Call": color = '#a855f7'; break; // purple-500
      case "Meeting": color = '#22c55e'; break; // green-500
      default: color = '#6b7280'; // gray-500
    }

    return {
      id: session.id,
      title: session.title,
      start: startDateTime,
      end: endDateTime,
      extendedProps: {
        location: session.location,
        notes: session.notes,
        sessionType: session.sessionType,
      },
      color: color,
    };
  });

  // Calculate current week's start and end based on the current view date
  const weekStart = useMemo(() => 
    startOfWeek(currentViewDate, { weekStartsOn: 1 }), 
    [currentViewDate]
  );
  
  const weekEnd = useMemo(() => 
    endOfWeek(currentViewDate, { weekStartsOn: 1 }), 
    [currentViewDate]
  );

  // Get all days in the current week
  const daysInWeek = useMemo(() => 
    eachDayOfInterval({ start: weekStart, end: weekEnd }), 
    [weekStart, weekEnd]
  );

  // Filter sessions for the current week
  const weekSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = parseISO(session.date);
      return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    }).sort((a, b) => {
      // Sort by date first, then by start time
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  }, [sessions, weekStart, weekEnd]);

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    
    // Initialize all days of the week with empty arrays
    daysInWeek.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = [];
    });
    
    // Add sessions to their respective days
    weekSessions.forEach(session => {
      if (grouped[session.date]) {
        grouped[session.date].push(session);
      }
    });
    
    return grouped;
  }, [weekSessions, daysInWeek]);

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground text-sm">
              Schedule and manage your mediation sessions.
            </p>
          </div>
          <div className="flex space-x-2">
            {isMobile && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShowWeeklySummary(!showWeeklySummary)}
                aria-label={showWeeklySummary ? "Hide weekly summary" : "Show weekly summary"}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={() => {
              setSelectedDate(currentDate);
              setIsCreateSessionDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> {!isMobile && "Add Session"}
            </Button>
          </div>
        </div>

        {/* Calendar and Session Details - Responsive Layout */}
        <div className={cn(
          "flex flex-col gap-4", 
          !isMobile && "md:flex-row md:gap-6",
          "h-[calc(100vh-12rem)]" // Adjust height to prevent overflow
        )}>
          {/* Conditionally show weekly summary first on mobile when expanded */}
          {isMobile && showWeeklySummary && (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Weekly Summary</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (calendarRef.current) {
                      calendarRef.current.getApi().today();
                      setCurrentViewDate(new Date());
                    }
                  }}
                >
                  Today
                </Button>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                {Object.entries(sessionsByDay).map(([date, daySessions]) => {
                  const dayDate = parseISO(date);
                  const isToday = format(dayDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
                  
                  return (
                    <div 
                      key={date} 
                      className={`border-b pb-2 ${isToday ? 'bg-muted/30 -mx-4 px-4 py-2 rounded-md' : ''}`}
                    >
                      <h3 className={`font-medium text-sm mb-1 ${isToday ? 'text-primary' : ''}`}>
                        {format(dayDate, 'EEEE, MMM d')} {isToday && <span className="text-xs ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">TODAY</span>}
                      </h3>
                      {daySessions.length > 0 ? (
                        <div className="space-y-2">
                          {daySessions.map(session => (
                            <div key={session.id} className="pl-2 border-l-2" style={{
                              borderLeftColor: 
                                session.sessionType === "Phone Call" ? '#3b82f6' : 
                                session.sessionType === "Video Call" ? '#a855f7' : '#22c55e'
                            }}>
                              <p className="font-medium text-sm">{session.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {session.startTime} - {session.endTime} · {session.sessionType}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No sessions</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FullCalendar - Responsive */}
          <div className={cn(
            "flex-1 min-h-[50vh]",
            !isMobile && !showWeeklySummary && "md:w-full",
            !isMobile && showWeeklySummary && "md:w-2/3"
          )}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: isMobile ? 'prev,next' : 'prev,next today',
                center: 'title',
                right: isMobile ? 'dayGridMonth,timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView={isMobile ? "dayGridMonth" : "dayGridMonth"}
              initialDate={currentDate}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={isMobile ? 2 : true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventReceive={handleEventReceive}
              height={isMobile ? "auto" : "100%"}
              contentHeight={isMobile ? "auto" : "auto"}
              aspectRatio={isMobile ? 1 : 1.35}
              datesSet={(dateInfo) => {
                setCurrentViewDate(dateInfo.start);
              }}
            />
          </div>

          {/* Weekly Summary Sidebar - Desktop Only */}
          {!isMobile && showWeeklySummary && (
            <div className="w-80 border-l pl-6 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Weekly Summary</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (calendarRef.current) {
                      calendarRef.current.getApi().today();
                      setCurrentViewDate(new Date());
                    }
                  }}
                >
                  Today
                </Button>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
              
              <div className="space-y-4">
                {Object.entries(sessionsByDay).map(([date, daySessions]) => {
                  const dayDate = parseISO(date);
                  const isToday = format(dayDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
                  
                  return (
                    <div 
                      key={date} 
                      className={`border-b pb-2 ${isToday ? 'bg-muted/30 -mx-6 px-6 py-2 rounded-md' : ''}`}
                    >
                      <h3 className={`font-medium text-sm mb-1 ${isToday ? 'text-primary' : ''}`}>
                        {format(dayDate, 'EEEE, MMM d')} {isToday && <span className="text-xs ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">TODAY</span>}
                      </h3>
                      {daySessions.length > 0 ? (
                        <div className="space-y-2">
                          {daySessions.map(session => (
                            <div key={session.id} className="pl-2 border-l-2" style={{
                              borderLeftColor: 
                                session.sessionType === "Phone Call" ? '#3b82f6' : 
                                session.sessionType === "Video Call" ? '#a855f7' : '#22c55e'
                            }}>
                              <p className="font-medium text-sm">{session.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {session.startTime} - {session.endTime} · {session.sessionType}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No sessions</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Session Dialog */}
      <CreateSessionDialog
        isOpen={isCreateSessionDialogOpen}
        onClose={() => setIsCreateSessionDialogOpen(false)}
        onAddSession={handleAddSession}
        initialDate={selectedDate || new Date()}
      />

      {/* Event Details Dialog */}
      <Dialog open={isEventDetailsDialogOpen} onOpenChange={setIsEventDetailsDialogOpen}>
        <DialogContent className={isMobile ? "sm:max-w-[90%] w-[90%] p-4" : undefined}>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Type:</strong> {selectedEvent.extendedProps?.sessionType}</p>
              <p><strong>Time:</strong> {format(new Date(selectedEvent.start), 'PPP p')} - {format(new Date(selectedEvent.end), 'p')}</p>
              {selectedEvent.extendedProps?.location && <p><strong>Location:</strong> {selectedEvent.extendedProps.location}</p>}
              {selectedEvent.extendedProps?.notes && <p><strong>Notes:</strong> {selectedEvent.extendedProps.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CalendarPage;