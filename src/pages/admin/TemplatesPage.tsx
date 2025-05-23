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
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileCheck, 
  Copy, 
  Plus, 
  Eye,
  Mail,
  MoveRight,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Mock data for document templates
const documentTemplates = [
  { 
    id: 1, 
    name: "Mediation Agreement", 
    category: "Agreements", 
    lastUpdated: "2023-04-10",
    usageCount: 28,
    status: "active"
  },
  { 
    id: 2, 
    name: "Intake Form", 
    category: "Forms", 
    lastUpdated: "2023-03-15",
    usageCount: 42,
    status: "active"
  },
  { 
    id: 3, 
    name: "Parenting Plan", 
    category: "Agreements", 
    lastUpdated: "2023-04-20",
    usageCount: 16,
    status: "active"
  },
  { 
    id: 4, 
    name: "Client Information Sheet", 
    category: "Forms", 
    lastUpdated: "2023-02-28",
    usageCount: 37,
    status: "active"
  },
  { 
    id: 5, 
    name: "Financial Statement", 
    category: "Forms", 
    lastUpdated: "2023-03-22",
    usageCount: 19,
    status: "active"
  },
  { 
    id: 6, 
    name: "Settlement Agreement", 
    category: "Agreements", 
    lastUpdated: "2023-04-05",
    usageCount: 11,
    status: "draft"
  },
];

// Template categories
const documentCategories = [
  { id: "agreements", name: "Agreements" },
  { id: "forms", name: "Forms" },
  { id: "reports", name: "Reports" },
  { id: "correspondence", name: "Correspondence" },
  { id: "other", name: "Other" },
];

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

export default function TemplatesPage() {
  const isMobile = useIsMobile();
  const [mainTab, setMainTab] = useState("document"); // Main tab: 'document' or 'email'
  
  // Document templates state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocTemplate, setSelectedDocTemplate] = useState<any>(null);
  const [docActiveTab, setDocActiveTab] = useState("all");
  
  // Email templates state
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showSendTestDialog, setShowSendTestDialog] = useState(false);
  const [showTestConfirmation, setShowTestConfirmation] = useState(false);
  
  // Document templates handlers
  const handleDeleteDoc = (template: any) => {
    setSelectedDocTemplate(template);
    setShowDeleteDialog(true);
  };

  // Filter document templates based on active tab
  const filteredDocTemplates = documentTemplates.filter(template => {
    const matchesTab = docActiveTab === "all" || 
                     (docActiveTab === "active" && template.status === "active") ||
                     (docActiveTab === "draft" && template.status === "draft") ||
                     (docActiveTab === template.category.toLowerCase());
    
    return matchesTab;
  });
  
  // Email templates handlers
  const handleEditEmailTemplate = (template: any) => {
    setSelectedEmailTemplate(template);
    setShowEditor(true);
  };
  
  const handlePreviewEmailTemplate = (template: any) => {
    setSelectedEmailTemplate(template);
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
          <h1 className="text-2xl md:text-3xl font-bold">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage document and email templates used throughout the system
          </p>
        </div>
      </div>

      {showTestConfirmation && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg flex gap-2 items-center">
          <CheckCircle className="h-5 w-5" />
          <span>Test email sent successfully to {testEmail}</span>
        </div>
      )}

      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Document Templates</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email Templates</span>
          </TabsTrigger>
        </TabsList>

        {/* Document Templates Tab Content */}
        <TabsContent value="document" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Tabs 
              defaultValue="all" 
              value={docActiveTab}
              onValueChange={setDocActiveTab}
              className="w-full"
            >
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>
                
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
              
              <TabsContent value="all" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocTemplates.map((template) => (
                    <DocumentTemplateCard 
                      key={template.id} 
                      template={template}
                      onDelete={handleDeleteDoc}
                    />
                  ))}
                </div>
                
                {filteredDocTemplates.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No templates found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first template to get started
                    </p>
                  </div>
                )}
              </TabsContent>
              
              {/* These repeat the same content but with different filters applied */}
              <TabsContent value="active" className="mt-4">
                {/* Same content as "all" but filtered for active templates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocTemplates.map((template) => (
                    <DocumentTemplateCard 
                      key={template.id} 
                      template={template}
                      onDelete={handleDeleteDoc}
                    />
                  ))}
                </div>
                
                {filteredDocTemplates.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No active templates found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      No active templates in the system
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="draft" className="mt-4">
                {/* Same content as "all" but filtered for draft templates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocTemplates.map((template) => (
                    <DocumentTemplateCard 
                      key={template.id} 
                      template={template}
                      onDelete={handleDeleteDoc}
                    />
                  ))}
                </div>
                
                {filteredDocTemplates.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No draft templates found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      No draft templates in the system
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Delete Document Template Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Template</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{selectedDocTemplate?.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4 pb-2">
                <p className="text-sm text-muted-foreground">
                  This template has been used {selectedDocTemplate?.usageCount} times. Deleting it will not affect documents already created with this template.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
                  Delete Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Email Templates Tab Content */}
        <TabsContent value="email" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">System Email Templates</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
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
                      <Button variant="outline" size="sm" onClick={() => handlePreviewEmailTemplate(template)}>
                        <Eye className="h-4 w-4 mr-1" /> Preview
                      </Button>
                      <Button size="sm" onClick={() => handleEditEmailTemplate(template)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Template Editor Dialog */}
          <Dialog open={showEditor} onOpenChange={setShowEditor}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Edit Email Template: {selectedEmailTemplate?.name}</DialogTitle>
                <DialogDescription>
                  Make changes to the email template. Use variables enclosed in curly braces.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input id="subject" defaultValue={selectedEmailTemplate?.subject} />
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
                          {selectedEmailTemplate?.variables.map((variable: string) => (
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
                            <Input id="category" defaultValue={selectedEmailTemplate?.category} className="mt-1" />
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

          {/* Email Template Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Preview: {selectedEmailTemplate?.name}</DialogTitle>
                <DialogDescription>
                  This is how the email will appear to recipients
                </DialogDescription>
              </DialogHeader>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-3 border-b">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-semibold">Subject: </span>
                      {selectedEmailTemplate?.subject}
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
                <Button onClick={() => handleEditEmailTemplate(selectedEmailTemplate)}>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Document Template Card Component
function DocumentTemplateCard({ template, onDelete }: { template: any, onDelete: (template: any) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">{template.category}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(template)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last updated: {template.lastUpdated}</span>
          {template.status === "draft" ? (
            <Badge variant="outline">Draft</Badge>
          ) : (
            <Badge className="bg-green-50 text-green-800">Active</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 pt-2 pb-2 px-6 flex justify-between items-center text-sm">
        <span className="flex items-center text-muted-foreground">
          <FileCheck className="h-4 w-4 mr-1" /> 
          Used {template.usageCount} times
        </span>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}