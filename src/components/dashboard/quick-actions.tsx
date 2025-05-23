import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, FileOutput, Plus } from "lucide-react";
import { CreateCaseDialog } from "@/components/dialogs/create-case-dialog";
import { CreateSessionDialog } from "@/components/dialogs/create-session-dialog";
import { CreateNoteDialog } from "@/components/dialogs/create-note-dialog";
import { CreateTemplateDialog } from "@/components/dialogs/create-template-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export function QuickActions() {
  const [isCreateCaseDialogOpen, setIsCreateCaseDialogOpen] = useState(false);
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [isCreateNoteDialogOpen, setIsCreateNoteDialogOpen] = useState(false);
  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);

  const isMobile = useIsMobile();

  return (
    <>
      <Card>
        <CardHeader className={isMobile ? "p-4 pb-2" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>Quick Actions</CardTitle>
          <CardDescription className={isMobile ? "text-xs" : ""}>Common tasks and actions</CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "p-4 pt-2" : ""}>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className={`${isMobile ? "h-16" : "h-20"} flex flex-col gap-1`}
              onClick={() => setIsCreateSessionDialogOpen(true)}
            >
              <Calendar className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
              <span className={isMobile ? "text-xs" : ""}>Add Session</span>
            </Button>
            <Button 
              variant="outline" 
              className={`${isMobile ? "h-16" : "h-20"} flex flex-col gap-1`}
              onClick={() => setIsCreateNoteDialogOpen(true)}
            >
              <FileText className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
              <span className={isMobile ? "text-xs" : ""}>Add Note</span>
            </Button>
            <Button 
              variant="outline" 
              className={`${isMobile ? "h-16" : "h-20"} flex flex-col gap-1`}
              onClick={() => setIsCreateTemplateDialogOpen(true)}
            >
              <FileOutput className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
              <span className={isMobile ? "text-xs" : ""}>Add Template</span>
            </Button>
            <Button 
              variant="outline" 
              className={`${isMobile ? "h-16" : "h-20"} flex flex-col gap-1`}
              onClick={() => setIsCreateCaseDialogOpen(true)} 
            >
              <Plus className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
              <span className={isMobile ? "text-xs" : ""}>Add Case</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateCaseDialog 
        isOpen={isCreateCaseDialogOpen} 
        onClose={() => setIsCreateCaseDialogOpen(false)} 
      />
      <CreateSessionDialog 
        isOpen={isCreateSessionDialogOpen} 
        onClose={() => setIsCreateSessionDialogOpen(false)} 
      />
      <CreateNoteDialog 
        isOpen={isCreateNoteDialogOpen} 
        onClose={() => setIsCreateNoteDialogOpen(false)} 
      />
      <CreateTemplateDialog 
        isOpen={isCreateTemplateDialogOpen} 
        onClose={() => setIsCreateTemplateDialogOpen(false)} 
      />
    </>
  );
}
