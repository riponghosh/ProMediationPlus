import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SendHorizonal, MessageSquare } from 'lucide-react';
import { getAllItems } from '@/services/localDbService';
import { Contact, Note, Task, CaseFileMetadata, Document } from '@/types/models';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Fetch data from IndexedDB
      let contacts: Contact[] = [];
      let notes: Note[] = [];
      let tasks: Task[] = [];
      let caseFiles: CaseFileMetadata[] = [];
      let documents: Document[] = [];
      try {
        // Fetch all relevant data types
        [contacts, notes, tasks, caseFiles, documents] = await Promise.all([
          getAllItems('contacts'),
          getAllItems('notes'),
          getAllItems('tasks'),
          getAllItems('caseFiles'),
          getAllItems('documents')
        ]);
        // --- DEBUGGING: Log fetched data ---
        console.log("Chatbot Context - Fetched Contacts:", contacts);
        console.log("Chatbot Context - Fetched Notes:", notes);
        console.log("Chatbot Context - Fetched Tasks:", tasks);
        // --- END DEBUGGING ---
      } catch (dbError) {
        console.error("Error fetching data for chatbot context:", dbError);
        toast.error("Could not load data for AI assistant.");
        // Optionally proceed without context or show error in chat
      }

      // Prepare payload with context
      const payload = {
        messages: [...messages, userMessage],
        context: {
          contacts: contacts,
          notes: notes,
          tasks: tasks,
          caseFiles: caseFiles,
          documents: documents,
          // TODO: Add intake form data from localStorage if feasible
          // TODO: Add calendar/meeting data if accessible
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send payload with context
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.content) {
        throw new Error('Invalid response format from API');
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-4 ${isMobile ? 'inset-x-4' : 'right-4'} z-50`}>
      {open ? (
        <Card className={`flex flex-col ${
          isMobile 
            ? 'w-full h-[300px]'
            : 'w-96 h-[300px]'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Mediation Pro AI</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 pb-0">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>How can I help you?</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]' : 'bg-muted max-w-[80%]'}`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="p-3 rounded-lg bg-muted max-w-[80%]">
                    Thinking...
                  </div>
                )}
                <div ref={messagesEndRef} /> {/* Scroll anchor */}
              </>
            )}
          </CardContent>
          <div className="p-4 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button 
            className="rounded-full w-10 h-10 p-0 shadow-lg flex items-center justify-center" 
            onClick={() => setOpen(true)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}