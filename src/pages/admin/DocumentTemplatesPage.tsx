import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { FileText, Search, Filter, MoreHorizontal, Edit, Trash2, FileCheck, Copy, Plus, Eye } from "lucide-react";

// Mock data for document templates
const templates = [
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
const categories = [
  { id: "agreements", name: "Agreements" },
  { id: "forms", name: "Forms" },
  { id: "reports", name: "Reports" },
  { id: "correspondence", name: "Correspondence" },
  { id: "other", name: "Other" },
];

export default function DocumentTemplatesPage() {
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleDelete = (template: any) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  // Filter templates based on active tab and search query
  const filteredTemplates = templates.filter(template => {
    const matchesTab = activeTab === "all" || 
                       (activeTab === "active" && template.status === "active") ||
                       (activeTab === "draft" && template.status === "draft") ||
                       (activeTab === template.category.toLowerCase());
    
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Document Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage document templates used throughout the system
          </p>
        </div>
        
        <Button className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search templates..." 
                className="pl-8 w-[200px] md:w-[250px]" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium">No templates found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search query" : "Create your first template to get started"}
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* These repeat the same content but with different filters applied */}
          <TabsContent value="active" className="mt-4">
            {/* Same content as "all" but filtered for active templates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium">No active templates found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search query" : "No active templates in the system"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="draft" className="mt-4">
            {/* Same content as "all" but filtered for draft templates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium">No draft templates found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search query" : "No draft templates in the system"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 pb-2">
            <p className="text-sm text-muted-foreground">
              This template has been used {selectedTemplate?.usageCount} times. Deleting it will not affect documents already created with this template.
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
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, onDelete }: { template: any, onDelete: (template: any) => void }) {
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