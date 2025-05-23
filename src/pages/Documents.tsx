import { useState, useEffect } from "react";
import { getAllItems } from "@/services/localDbService";
import type { Matter } from "@/types/models";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, Search, Plus, MoreHorizontal, Trash, Download, Share2,
  Edit, FolderOpen, ChevronRight, ArrowLeft, Folder, Files,
  File, FilePlus2, Grid, List, Upload, FolderPlus, FilePlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreateDocumentDialog } from "@/components/dialogs/create-document-dialog"; // Assuming this component exists
import { EditDocumentDialog, DocumentFormValues } from "@/components/dialogs/edit-document-dialog"; // Assuming this component exists
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

// Define types for better type checking
interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  createdAt: string; // Changed from matter to caseFileNumber
  caseFileNumber: string;
  owner: string;
  parentId: number | null; // Added to link documents to folders
}

interface Folder {
  id: number;
  name: string;
  type: "folder";
  parentId: number | null;
  path: string[];
}

// Define a type for items that can be in the file system
type FileSystemItem = Document | Folder;

// Mock data for documents
const initialDocuments: Document[] = [
  {
    id: 1,
    name: "Smith vs. Johnson Agreement.pdf",
    type: "pdf",
    size: "1.2 MB",
    createdAt: "2023-06-15",
    caseFileNumber: "CF-2023-001", // Updated from matter
    owner: "John Smith",
    parentId: 6 // Inside "Case Files/Smith vs. Johnson/Agreements"
  },
  {
    id: 2,
    name: "Property Dispute Resolution Notes.docx",
    type: "docx",
    size: "0.8 MB",
    createdAt: "2023-06-12",
    caseFileNumber: "CF-2023-002", // Updated from matter
    owner: "Sarah Johnson",
    parentId: 5 // Inside "Case Files/Property Dispute"
  },
  {
    id: 3,
    name: "Brown Employment Contract.pdf",
    type: "pdf",
    size: "2.5 MB",
    createdAt: "2023-06-10",
    caseFileNumber: "CF-2023-003", // Updated from matter
    owner: "Robert Brown",
    parentId: null // In root
  },
  {
    id: 4,
    name: "Mediation Guidelines.pdf",
    type: "pdf",
    size: "0.5 MB",
    createdAt: "2023-06-05",
    caseFileNumber: "General", // Keeping as string for non-case specific docs
    owner: "Andrew Rooney",
    parentId: 3 // Inside "Templates" (Note: Templates folder is filtered out in initialFolders)
  },
  {
    id: 5,
    name: "Billing Records May 2023.xlsx",
    type: "xlsx",
    size: "1.8 MB",
    createdAt: "2023-06-01",
    caseFileNumber: "Administrative", // Keeping as string for non-case specific docs
    owner: "Andrew Rooney",
    parentId: 2 // Inside "Administrative"
  }
];

// Mock data for folders
const initialFolders: Folder[] = [
  {
    id: 1,
    name: "Case Files",
    type: "folder",
    parentId: null,
    path: ["Case Files"]
  },
  {
    id: 2,
    name: "Administrative",
    type: "folder",
    parentId: null,
    path: ["Administrative"]
  },
  {
    id: 3, // Added Templates folder back for document 4
    name: "Templates",
    type: "folder",
    parentId: null,
    path: ["Templates"]
  },
  {
    id: 4,
    name: "Smith vs. Johnson",
    type: "folder",
    parentId: 1,
    path: ["Case Files", "Smith vs. Johnson"]
  },
  {
    id: 5,
    name: "Property Dispute",
    type: "folder",
    parentId: 1,
    path: ["Case Files", "Property Dispute"]
  },
  {
    id: 6,
    name: "Agreements",
    type: "folder",
    parentId: 4,
    path: ["Case Files", "Smith vs. Johnson", "Agreements"]
  },
  {
    id: 7,
    name: "Notes",
    type: "folder",
    parentId: 4,
    path: ["Case Files", "Smith vs. Johnson", "Notes"]
  }
];

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>(initialFolders); // Include Templates folder
  const [matters, setMatters] = useState<Matter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [itemToRename, setItemToRename] = useState<{id: number, name: string, type: "document" | "folder"} | null>(null);
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // Keep tabs for filtering within the view
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // State for view mode
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false); // State for FAB menu

  // Helper for icon size - matching Settings.tsx
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  useEffect(() => {
    const loadData = async () => {
      try {
        let loadedMatters: Matter[] = [];
        let loadedDocuments: Document[] = [];

        try {
          [loadedMatters, loadedDocuments] = await Promise.all([
            getAllItems('matters'),
            getAllItems('documents'),
          ]);
        } catch (error) {
          console.error("Failed to load data from local DB", error);
          loadedDocuments = initialDocuments;
        }

        if (loadedDocuments.length === 0) {
          loadedDocuments = initialDocuments;
        }

        setMatters(loadedMatters);
        setDocuments(loadedDocuments);
      } catch (error) {
        console.error("Failed to load data", error);
        setDocuments(initialDocuments);
      }
    };
    loadData();
  }, []);

  // Get folders and documents in the current directory
  let currentFolders = folders.filter(folder =>
    folder.parentId === (currentFolder ? currentFolder.id : null)
  );

  const breadcrumbs = currentFolder ? currentFolder.path : [];

  // Get documents for the current folder (or root if no folder selected)
  const currentDocuments = documents.filter(doc =>
    doc.parentId === (currentFolder ? currentFolder.id : null)
  );

  // Filter based on active tab
  const getFilteredDocuments = () => {
    const documentsInCurrentLocation = documents.filter(doc =>
      doc.parentId === (currentFolder ? currentFolder.id : null)
    );

    // Filter by type if needed
    if (activeTab === "all") {
      return documentsInCurrentLocation;
    } else {
      return documentsInCurrentLocation.filter(doc => doc.type.toLowerCase() === activeTab);
    }
  };

  // Combined and filtered list for the view
  const filteredItems: FileSystemItem[] = [...currentFolders, ...getFilteredDocuments()]
    .filter(item =>
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle document deletion
  const handleDeleteDocument = (id: number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success("Document deleted successfully");
  };

  // Handle folder deletion
  const handleDeleteFolder = (id: number) => {
    // Get all descendants of this folder
    const descendantIds = getAllDescendantIds(id);

    // Remove this folder and all descendants
    setFolders(prev => prev.filter(folder =>
      folder.id !== id && !descendantIds.includes(folder.id)
    ));

    // Also remove documents within these folders
    setDocuments(prev => prev.filter(doc =>
      !descendantIds.includes(doc.parentId!) && doc.parentId !== id
    ));

    toast.success("Folder and its contents deleted successfully");
  };

  // Helper to get all descendants of a folder
  const getAllDescendantIds = (folderId: number): number[] => {
    const directChildren = folders.filter(f => f.parentId === folderId);
    const descendantIds: number[] = directChildren.map(f => f.id);

    directChildren.forEach(child => {
      const childDescendants = getAllDescendantIds(child.id);
      descendantIds.push(...childDescendants);
    });

    return descendantIds;
  };

  // Handle navigation to a folder
  const handleOpenFolder = (folder: Folder) => {
    setCurrentFolder(folder);
    setActiveTab("all"); // Reset tab when changing folders
  };

  // Handle navigation to parent folder
  const handleNavigateUp = () => {
    if (!currentFolder) return;
    if (currentFolder.parentId === null) {
      setCurrentFolder(null);
    } else {
      const parentFolder = folders.find(f => f.id === currentFolder.parentId);
      if (parentFolder) setCurrentFolder(parentFolder);
    }
    setActiveTab("all"); // Reset tab when navigating up
  };

  // Handle navigation via breadcrumbs
  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentFolder(null);
    } else {
      if (!currentFolder) return;
      const path = currentFolder.path.slice(0, index);
      const targetFolder = folders.find(f =>
        f.path.length === path.length &&
        f.path.every((segment, i) => segment === path[i])
      );
      if (targetFolder) setCurrentFolder(targetFolder);
    }
    setActiveTab("all"); // Reset tab when navigating via breadcrumbs
  };

  // Handle creating a new folder
  const handleCreateFolder = () => {
    setIsFabMenuOpen(false); // Close FAB menu
    const defaultName = "New Folder";
    let newFolderName = defaultName;
    let counter = 1;
    while (folders.some(f => f.name === newFolderName && f.parentId === (currentFolder ? currentFolder.id : null))) {
      newFolderName = `${defaultName} (${counter})`;
      counter++;
    }

    const newFolder: Folder = {
      id: Math.max(0, ...folders.map(f => f.id)) + 1,
      name: newFolderName,
      type: "folder",
      parentId: currentFolder ? currentFolder.id : null,
      path: currentFolder ? [...currentFolder.path, newFolderName] : [newFolderName]
    };

    setFolders(prev => [...prev, newFolder]);

    // Start renaming the new folder immediately
    setItemToRename({
      id: newFolder.id,
      name: newFolder.name,
      type: "folder"
    });
    setNewName(newFolder.name);
    setIsRenaming(true);
  };

  // Handle uploading files
  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFabMenuOpen(false); // Close FAB menu
    const files = e.target.files;
    if (!files) return;
    const newDocs: Document[] = [];
    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = fileExt === 'pdf' ? 'pdf' :
                      (fileExt === 'docx' || fileExt === 'doc') ? 'docx' :
                      (fileExt === 'xlsx' || fileExt === 'xls') ? 'xlsx' : 'file';

      const newDoc: Document = {
        id: Math.max(0, ...documents.map(d => d.id)) + 1 + newDocs.length,
        name: file.name,
        type: fileType,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        createdAt: new Date().toISOString().split('T')[0],
        caseFileNumber: currentFolder?.name || 'General', // Assign case file based on folder? Or prompt user?
        owner: 'You', // Assign owner
        parentId: currentFolder ? currentFolder.id : null,
      };
      newDocs.push(newDoc);
    }

    setDocuments(prev => [...prev, ...newDocs]);
    toast.success(`${newDocs.length} document${newDocs.length !== 1 ? 's' : ''} uploaded successfully`);
    e.target.value = ''; // Clear the input
  };

  // Handle creating a new document (placeholder)
  const handleCreateDocument = () => {
    setIsFabMenuOpen(false); // Close FAB menu
    // This would typically open a dialog to select document type (e.g., Word, Sheet, Slide)
    // For now, let's just add a placeholder document
    const newDoc: Document = {
      id: Math.max(0, ...documents.map(d => d.id)) + 1,
      name: "New Document",
      type: "docx", // Default to docx
      size: "0 MB",
      createdAt: new Date().toISOString().split('T')[0],
      caseFileNumber: currentFolder?.name || 'General',
      owner: 'You',
      parentId: currentFolder ? currentFolder.id : null,
    };
    setDocuments(prev => [...prev, newDoc]);
    toast.success("New document created (placeholder)");
    // You would likely open an editor or a dialog here
  };


  // Start renaming an item
  const startRenaming = (id: number, name: string, type: "document" | "folder") => {
    setItemToRename({ id, name, type });
    setNewName(name);
    setIsRenaming(true);
  };

  // Handle renaming an item
  const handleRename = () => {
    if (!itemToRename) return;

    if (itemToRename.type === "folder") {
      const folderToRename = folders.find(f => f.id === itemToRename.id);
      if (!folderToRename) return;

      // Update the folder and all its descendants' paths
      setFolders(prev => prev.map(folder => {
        if (folder.id === itemToRename.id) {
          const newPath = currentFolder ? [...currentFolder.path, newName] : [newName];
           // Ensure path is correct based on parent
          return { ...folder, name: newName, path: newPath };
        }

        // Update descendants paths - this logic needs refinement for complex moves
        // For simplicity, let's just update the name for now. Path updates on rename are complex.
        // A full path update would require recalculating paths for all children recursively.
        // Let's skip recursive path updates on rename for this example to keep it simpler.
        // If a folder is renamed, its children's paths should reflect the new parent name.
        // This is a more advanced feature.

        return folder;
      }));
    } else {
      // Rename document
      setDocuments(prev => prev.map(doc =>
        doc.id === itemToRename.id ? { ...doc, name: newName } : doc
      ));
    }

    setIsRenaming(false);
    setItemToRename(null);
    setNewName("");

    toast.success("Item renamed successfully");
  };

  // Handle document save (assuming EditDocumentDialog exists)
  const handleSaveDocument = (updatedDoc: DocumentFormValues) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === updatedDoc.id
          ? { ...doc, ...updatedDoc }
          : doc
      )
    );
    toast.success("Document updated successfully");
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "xlsx":
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date for display (Google Drive often shows "Modified" date)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Example: "Jun 10, 2023" or "Modified yesterday" or "Modified Aug 25"
    // For simplicity, let's stick to a consistent format for now
     return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined, // Show year only if not current year
    });
  };

  // Type guard to check if an item is a Document
  const isDocument = (item: FileSystemItem): item is Document => {
    return 'createdAt' in item && 'size' in item;
  };

  // Type guard to check if an item is a Folder
  const isFolder = (item: FileSystemItem): item is Folder => {
    return item.type === 'folder';
  };

  const getTitle = () => {
    if (currentFolder) {
      return currentFolder.name;
    }
    return "My Drive"; // Or "Documents"
  };

  return (
    <Layout>
      <div className={`flex flex-col h-full ${isMobile ? "space-y-2" : "space-y-4"}`}>
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          {/* Title and Breadcrumbs */}
          <div className="flex items-center gap-2">
             {currentFolder && (
               <Button
                 variant="ghost"
                 size="sm"
                 className={`${isMobile ? "h-6 px-1" : "h-8 px-2"}`}
                 onClick={handleNavigateUp}
               >
                 <ArrowLeft className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
               </Button>
             )}
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>
              {getTitle()}
            </h1>
             {/* Breadcrumb navigation */}
             {currentFolder && (
               <div className={`flex items-center ${isMobile ? "text-xs" : ""}`}>
                 <Button
                   variant="ghost"
                   size="sm"
                   className={`${isMobile ? "h-6 px-1" : "h-8 px-2"}`}
                   onClick={() => handleBreadcrumbClick(0)}
                 >
                   Home
                 </Button>

                 {breadcrumbs.map((crumb, index) => (
                   <div key={index} className="flex items-center">
                     <ChevronRight className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground mx-1`} />
                     <Button
                       variant="ghost"
                       size="sm"
                       className={`${isMobile ? "h-6 px-1 text-xs" : "h-8 px-2"}`}
                       onClick={() => handleBreadcrumbClick(index + 1)}
                       disabled={index === breadcrumbs.length - 1}
                     >
                       {crumb}
                     </Button>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-xs">
              <Search className={`absolute left-2.5 ${isMobile ? "top-1.5 h-3 w-3" : "top-2.5 h-4 w-4"} text-muted-foreground`} />
              <Input
                placeholder="Search documents..."
                className={`${isMobile ? "text-xs h-6 pl-7" : "pl-8"}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* View Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`${isMobile ? "h-6 w-6" : "h-8 w-8"}`}
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              title={viewMode === 'list' ? 'Grid view' : 'List view'}
            >
              {viewMode === 'list' ? <Grid className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} /> : <List className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />}
            </Button>
             {/* More Options (optional, similar to Google Drive's top-right menu) */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className={`${isMobile ? "h-6 w-6" : "h-8 w-8"}`}>
                   <MoreHorizontal className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem>Settings</DropdownMenuItem>
                 <DropdownMenuItem>Help</DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>

        {/* Tabs for Filtering - Updated to match Settings.tsx styling */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`
            grid ${isMobile ? "grid-cols-4" : "grid-cols-4"}
            w-full
            h-auto p-1
            bg-muted rounded-lg
            gap-1
            ${!isMobile ? 'md:w-auto md:inline-grid' : ''}
          `}>
            <TabsTrigger 
              value="all" 
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <Files className={iconSizeClass} />
              All
            </TabsTrigger>
            <TabsTrigger 
              value="pdf" 
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <FileText className={`${iconSizeClass} text-red-500`} />
              PDF
            </TabsTrigger>
            <TabsTrigger 
              value="docx" 
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <FileText className={`${iconSizeClass} text-blue-500`} />
              Word
            </TabsTrigger>
            <TabsTrigger 
              value="xlsx" 
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <FileText className={`${iconSizeClass} text-green-500`} />
              Excel
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* File and Folder List/Grid Area */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className={`flex-1 overflow-y-auto overflow-x-hidden p-0 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4' : ''}`}>
            {filteredItems.length > 0 ? (
              viewMode === 'list' ? (
                // List View
                <div className="divide-y">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${isMobile ? "p-2" : "p-4"} hover:bg-muted/50 transition-colors`}
                    >
                      <div
                        className="flex items-center cursor-pointer flex-1 min-w-0"
                        onClick={() => {
                          if (isFolder(item)) {
                            handleOpenFolder(item);
                          }
                          // Add logic to open/preview document if needed
                        }}
                      >
                        <div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0`}>
                          {isFolder(item) ? (
                            <FolderOpen className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-amber-500`} />
                          ) : (
                            <span className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}>
                              {getFileIcon(item.type)}
                            </span>
                          )}
                        </div>

                        <div className="ml-3 min-w-0 flex-1">
                          <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium truncate`}>
                            {item.name}
                          </p>
                          {isDocument(item) && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <span className={isMobile ? "text-[0.65rem]" : ""}>
                                {formatDate(item.createdAt)} • {item.size}
                                {item.caseFileNumber && item.caseFileNumber !== 'General' && ` • ${item.caseFileNumber}`}
                              </span>
                            </div>
                          )}
                           {isFolder(item) && (
                             <div className="flex items-center text-xs text-muted-foreground mt-1">
                               {/* Add folder details like number of items or modified date if available */}
                               <span>Folder</span> {/* Placeholder */}
                             </div>
                           )}
                        </div>
                      </div>

                      <div className={`${isMobile ? "mt-1 ml-11" : "mt-0"} sm:mt-0 flex items-center flex-shrink-0`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => startRenaming(
                                item.id,
                                item.name,
                                isFolder(item) ? 'folder' : 'document'
                              )}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Rename
                            </DropdownMenuItem>

                            {isDocument(item) && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  // Implement download logic here
                                  toast.success("Download started");
                                }}>
                                  <Download className="h-4 w-4 mr-2" /> Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  // Implement share logic here
                                  toast.success("Link copied to clipboard");
                                }}>
                                  <Share2 className="h-4 w-4 mr-2" /> Share
                                </DropdownMenuItem>
                                {/* Add other document actions like "Open" */}
                              </>
                            )}
                             {isFolder(item) && (
                               <>
                                 <DropdownMenuItem onClick={() => { /* Implement Share Folder */ }}>
                                   <Share2 className="h-4 w-4 mr-2" /> Share
                                 </DropdownMenuItem>
                                 {/* Add other folder actions like "Move", "Add shortcut" */}
                               </>
                             )}

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (isFolder(item)) {
                                  handleDeleteFolder(item.id);
                                } else {
                                  handleDeleteDocument(item.id);
                                }
                              }}
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Grid View
                <>
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        if (isFolder(item)) {
                          handleOpenFolder(item);
                        }
                        // Add logic to open/preview document if needed
                      }}
                    >
                      <div className="flex-shrink-0">
                         {isFolder(item) ? (
                           <FolderOpen className="h-12 w-12 text-amber-500" />
                         ) : (
                           <div className="h-12 w-12 flex items-center justify-center">
                             {getFileIcon(item.type)} {/* Use file icon for documents */}
                           </div>
                         )}
                      </div>
                      <p className="mt-2 text-center text-sm font-medium truncate w-full px-2">{item.name}</p>
                       {isDocument(item) && (
                         <p className="text-xs text-muted-foreground mt-1">{item.size}</p>
                       )}
                       {/* Add more details like modified date if needed */}
                    </div>
                  ))}
                </>
              )
            ) : (
              <div className={`${isMobile ? "p-4 text-sm" : "p-6"} text-center text-muted-foreground`}>
                <p>No documents or folders found in this location.</p>
                {/* FAB will handle creation */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-6 right-6 z-50">
          {isFabMenuOpen && (
            <div className="absolute bottom-14 right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-1">
              <DropdownMenuItem className="cursor-pointer" onClick={handleCreateFolder}>
                <FolderPlus className="h-4 w-4 mr-2" /> New Folder
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => document.getElementById('fab-file-upload-input')?.click()}>
                 <Upload className="h-4 w-4 mr-2" /> File Upload
              </DropdownMenuItem>
              <input
                id="fab-file-upload-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleUploadFiles}
              />
              <DropdownMenuItem className="cursor-pointer" onClick={handleCreateDocument}>
                 <FilePlus className="h-4 w-4 mr-2" /> New Document
              </DropdownMenuItem>
               {/* Add options for New Sheet, New Slide, etc. */}
            </div>
          )}
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>


        {/* Rename Dialog */}
        <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rename {itemToRename?.type === 'folder' ? 'Folder' : 'Document'}</DialogTitle>
              <DialogDescription>
                Enter a new name for this {itemToRename?.type === 'folder' ? 'folder' : 'document'}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRenaming(false);
                  setItemToRename(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRename}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assuming CreateDocumentDialog and EditDocumentDialog exist and are handled elsewhere */}
        {/* <CreateDocumentDialog /> */}
        {/* <EditDocumentDialog /> */}

      </div>
    </Layout>
  );
};

export default DocumentsPage;