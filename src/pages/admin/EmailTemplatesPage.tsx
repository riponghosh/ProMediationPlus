import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Mail, Edit, Eye, MoreHorizontal, MoveRight, Clock, CheckCircle, AlertCircle } from "lucide-react";

// Mock data for email templates
const emailTemplates = [
  {
    id: "welcome-email",
    name: "Welcome Email",
    description: "Sent to new users when they create an account",
    subject: "Welcome to MediatorPro",
    lastUpdated: "2023-04-05",
    category: "Onboarding",
    variables: ["user.firstName", "user.lastName", "user.email", "login.url"],
  },
  {
    id: "password-reset",
    name: "Password Reset",
    description: "Sent when users request a password reset",
    subject: "Reset Your MediatorPro Password",
    lastUpdated: "2023-03-20",
    category: "Account",
    variables: ["user.firstName", "user.email", "reset.token", "reset.url", "reset.expiresIn"],
  },
  {
    id: "appointment-reminder",
    name: "Appointment Reminder",
    description: "Sent 24 hours before a scheduled mediation session",
    subject: "Reminder: Your Mediation Session Tomorrow",
    lastUpdated: "2023-04-12",
    category: "Sessions",
    variables: ["user.firstName", "client.name", "session.date", "session.time", "session.location", "session.notes"],
  },
  {
    id: "session-follow-up",
    name: "Session Follow-up",
    description: "Sent after a mediation session to collect feedback",
    subject: "Follow-up on Your Recent Mediation Session",
    lastUpdated: "2023-03-18",
    category: "Sessions",
    variables: ["user.firstName", "client.name", "session.date", "feedback.url"],
  },
  {
    id: "document-shared",
    name: "Document Shared",
    description: "Sent when a document is shared with a client",
    subject: "A Document Has Been Shared With You",
    lastUpdated: "2023-02-25",
    category: "Documents",
    variables: ["user.firstName", "sender.name", "document.name", "document.url", "document.expiresIn"],
  },
  {
    id: "invoice-created",
    name: "Invoice Created",
    description: "Sent when a new invoice is created for a client",
    subject: "New Invoice from MediatorPro",
    lastUpdated: "2023-01-30",
    category: "Billing",
    variables: ["client.firstName", "client.lastName", "invoice.number", "invoice.amount", "invoice.dueDate", "invoice.url"],
  },
];

export default function EmailTemplatesPage() {
  const isMobile = useIsMobile();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showSendTestDialog, setShowSendTestDialog] = useState(false);
  const [showTestConfirmation, setShowTestConfirmation] = useState(false);
  
  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };
  
  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };
  
  const handleSendTest = () => {
    setShowSendTestDialog(true);
  };
  
  const handleSendTestConfirm = () => {
    setShowSendTestDialog(false);
    setShowTestConfirmation(true);
    setTimeout(() => setShowTestConfirmation(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage email templates used for system notifications and communications
          </p>
        </div>
      </div>

      {showTestConfirmation && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg flex gap-2 items-center">
          <CheckCircle className="h-5 w-5" />
          <span>Test email sent successfully to {testEmail}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Email Templates</CardTitle>
          <CardDescription>
            These templates are used for automated emails sent by the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {emailTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex-grow pr-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="text-xs text-muted-foreground mt-1">Last updated: {template.lastUpdated}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template)}>
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </Button>
                  <Button size="sm" onClick={() => handleEditTemplate(template)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Email Template: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Make changes to the email template. Use variables enclosed in curly braces.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input id="subject" defaultValue={selectedTemplate?.subject} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editor">Email Body</Label>
                <div className="border rounded-md p-4 min-h-[300px] bg-white">
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Email Editor Placeholder</p>
                    {/* In a real implementation, this would be a rich text editor */}
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="variables">
                  <AccordionTrigger>Available Variables</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTemplate?.variables.map((variable: string) => (
                        <div key={variable} className="text-sm p-1 bg-muted rounded flex items-center">
                          <code className="font-mono text-xs">{`{{${variable}}}`}</code>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="settings">
                  <AccordionTrigger>Template Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="active-template" defaultChecked />
                        <Label htmlFor="active-template">Template is active</Label>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" defaultValue={selectedTemplate?.category} className="mt-1" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleSendTest}>
              Send Test Email
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              This is how the email will appear to recipients
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-3 border-b">
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-semibold">Subject: </span>
                  {selectedTemplate?.subject}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">To: </span>
                  <span className="text-muted-foreground">recipient@example.com</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">From: </span>
                  <span className="text-muted-foreground">no-reply@mediatorpro.com</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 min-h-[250px]">
              <div className="text-center text-muted-foreground py-8">
                <Mail className="h-8 w-8 mx-auto mb-2" />
                <p>Email content preview placeholder</p>
                <p className="text-sm mt-2">Variables would be replaced with actual values</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleSendTest}>
              Send Test Email
            </Button>
            <Button onClick={() => handleEditTemplate(selectedTemplate)}>
              <Edit className="h-4 w-4 mr-1" /> Edit Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Test Email Dialog */}
      <Dialog open={showSendTestDialog} onOpenChange={setShowSendTestDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify the template appearance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="test-email">Recipient Email</Label>
              <Input 
                id="test-email" 
                type="email" 
                placeholder="Enter email address" 
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <input type="checkbox" id="include-test-banner" defaultChecked />
              <Label htmlFor="include-test-banner">Include test banner in email</Label>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  Test emails will use placeholder data for variables. Some links may not be functional.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTestConfirm}>
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}