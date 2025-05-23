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
import { BookOpen, Search, MoreHorizontal, Edit, Trash2, Eye, Plus, Archive, SquarePen, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for guides
const guides = [
  { 
    id: 1, 
    title: "Getting Started with Mediation", 
    category: "Onboarding", 
    lastUpdated: "2023-04-15",
    author: "Emma Wilson",
    status: "published",
    viewCount: 245,
    path: "/admin/guides/getting-started"
  },
  { 
    id: 2, 
    title: "How to Prepare Clients for Mediation", 
    category: "Best Practices", 
    lastUpdated: "2023-03-22",
    author: "Michael Roberts",
    status: "published",
    viewCount: 189
  },
  { 
    id: 3, 
    title: "Document Management Guide", 
    category: "How-to", 
    lastUpdated: "2023-04-10",
    author: "David Anderson",
    status: "published",
    viewCount: 156
  },
  { 
    id: 4, 
    title: "Billing and Invoicing Procedures", 
    category: "How-to", 
    lastUpdated: "2023-03-18",
    author: "Sarah Johnson",
    status: "draft",
    viewCount: 0
  },
  { 
    id: 5, 
    title: "Advanced Conflict Resolution Techniques", 
    category: "Best Practices", 
    lastUpdated: "2023-02-28",
    author: "Emma Wilson",
    status: "published",
    viewCount: 210
  },
  { 
    id: 6, 
    title: "Client Privacy and Data Protection", 
    category: "Compliance", 
    lastUpdated: "2023-04-05",
    author: "Michael Roberts",
    status: "review",
    viewCount: 0
  },
];

// Guide categories
const categories = [
  { id: "onboarding", name: "Onboarding" },
  { id: "how-to", name: "How-to" },
  { id: "best-practices", name: "Best Practices" },
  { id: "compliance", name: "Compliance" },
  { id: "troubleshooting", name: "Troubleshooting" },
];

export default function GuidesManagementPage() {
  const isMobile = useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleDelete = (guide: any) => {
    setSelectedGuide(guide);
    setShowDeleteDialog(true);
  };

  // Filter guides based on active tab and search query
  const filteredGuides = guides.filter(guide => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "published" && guide.status === "published") ||
                      (activeTab === "draft" && guide.status === "draft") ||
                      (activeTab === "review" && guide.status === "review") ||
                      (activeTab === guide.category.toLowerCase());
    
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Guides Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user guides, articles, and documentation
          </p>
        </div>
        
        <Button className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Create Guide
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="review">Under Review</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search guides..." 
                  className="pl-8 w-[200px] md:w-[250px]" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Guides & Articles</CardTitle>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                    Sort
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredGuides.length > 0 ? (
                  <div className="divide-y">
                    {filteredGuides.map((guide) => (
                      <div 
                        key={guide.id} 
                        className={`flex items-start justify-between p-4 hover:bg-muted/50 ${guide.path ? 'cursor-pointer' : ''}`}
                      >
                        {guide.path ? (
                          <Link 
                            to={guide.path} 
                            className="flex-grow pr-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                              <h3 className="font-medium">{guide.title}</h3>
                              {getStatusBadge(guide.status)}
                            </div>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                              <span>Category: {guide.category}</span>
                              <span>By: {guide.author}</span>
                              <span>Updated: {guide.lastUpdated}</span>
                              {guide.status === "published" && (
                                <span>{guide.viewCount} views</span>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <div className="flex-grow pr-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                              <h3 className="font-medium">{guide.title}</h3>
                              {getStatusBadge(guide.status)}
                            </div>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                              <span>Category: {guide.category}</span>
                              <span>By: {guide.author}</span>
                              <span>Updated: {guide.lastUpdated}</span>
                              {guide.status === "published" && (
                                <span>{guide.viewCount} views</span>
                              )}
                            </div>
                          </div>
                        )}
                        <GuideActions guide={guide} onDelete={handleDelete} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No guides found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? "Try adjusting your search query" : "Create your first guide to get started"}
                    </p>
                  </div>
                )}
              </CardContent>
              {filteredGuides.length > 0 && (
                <CardFooter className="flex justify-between items-center border-t px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredGuides.length} of {guides.length} guides
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Guide</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedGuide?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
              Delete Guide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for the actions dropdown
function GuideActions({ guide, onDelete }: { guide: any, onDelete: (guide: any) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" /> Preview
        </DropdownMenuItem>
        <DropdownMenuItem>
          {guide.path ? (
            <Link to={guide.path} className="flex items-center w-full">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          ) : (
            <><Edit className="mr-2 h-4 w-4" /> Edit</>
          )}
        </DropdownMenuItem>
        {guide.status !== "published" ? (
          <DropdownMenuItem>
            <SquarePen className="mr-2 h-4 w-4" /> Publish
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Archive className="mr-2 h-4 w-4" /> Unpublish
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(guide)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to generate status badges
function getStatusBadge(status: string) {
  switch(status.toLowerCase()) {
    case "published":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>;
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "review":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Review</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}