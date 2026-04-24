import React, { useState, useEffect } from "react"; // Added React import
import { Layout } from "@/components/layout/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Briefcase,
  FileText,
  CheckSquare,
  MessageSquare,
  Clock,
  Calendar,
  Users,
  FileIcon,
  File,
  Plus,
  ArrowLeft,
  UserCheck, // Added for Intake Form tab
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { toast } from "sonner";
// Corrected import path casing for CaseDetails
import { CaseDetails } from "@/components/cases/CaseDetails"; 
import { getItem, getItemsByIndex, putItem, getNotesForCase } from "@/services/localDbService"; // Import DB service functions
import type { Case as CaseType, CaseFileMetadata, Task, Note as NoteType } from "@/types/models"; // Import correct types
import { Folder, ChevronRight } from "lucide-react"; // Added Folder icon
import { getCaseById } from "@/api/CaseServices";

// Use imported types directly
// Remove local interface definitions for Matter, Document, Task, MeetingNote, NextSession

// Remove mock data and localStorage helpers


const CaseDetailPage = () => {
  const { id: caseId } = useParams<{ id: string }>(); // Rename id to caseId for clarity
console.log("CaseDetailPage rendered with caseId:", caseId); // Debug log for caseId
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!caseId) {
      setNotes([]);
      return;
    }
    getNotesForCase(caseId)
      .then(setNotes)
      .catch((error) => {
        console.error("Failed to load notes:", error);
        setNotes([]);
      });
  }, [caseId]);
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentMatter, setCurrentMatter] = useState<CaseType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for folder navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // null represents the root
  const [displayedItems, setDisplayedItems] = useState<CaseFileMetadata[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: "Documents" }]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Fetch Matter details
  useEffect(() => {
    const loadMatter = async () => {
      if (!caseId) {
        setError("No case ID provided.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const matter = await getCaseById(caseId); // Changed 'matters' to 'cases'
        if (matter) {
          setCurrentMatter(matter.data as CaseType); // Ensure correct typing
          setError(null);
        } else {
          setError("Case not found.");
          setCurrentMatter(null);
        }
      } catch (e) {
        console.error("Error loading matter data:", e);
        setError("Failed to load case data.");
        setCurrentMatter(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadMatter();
  }, [caseId]);

  // Fetch files/folders for the current folder
  // useEffect(() => {
  //   const loadFolderContents = async () => {
  //     if (!caseId) return; // Don't fetch if caseId isn't available

  //     setIsLoadingFiles(true);
  //     try {
  //       // Use compound key for the index query: [caseId, parentId]
  //       // Use empty string "" to represent the root parentId in the query
  //       const parentIdQuery = currentFolderId === null ? "" : currentFolderId;
  //       const items = await getCaseById(caseId);
  //       // Sort folders first, then files, alphabetically
  //       // items.sort((a, b) => {
  //       //     if (a.itemType === 'folder' && b.itemType !== 'folder') return -1;
  //       //     if (a.itemType !== 'folder' && b.itemType === 'folder') return 1;
  //       //     return a.name.localeCompare(b.name);
  //       // });
  //       setDisplayedItems(items.data);
  //     } catch (e) {
  //       console.error(`Error loading items for folder ${currentFolderId}:`, e);
  //       toast.error("Failed to load folder contents.");
  //       setDisplayedItems([]); // Clear items on error
  //     } finally {
  //       setIsLoadingFiles(false);
  //     }
  //   };

  //   loadFolderContents();
  // }, [caseId, currentFolderId]); // Re-fetch when caseId or currentFolderId changes

  // Updated save handler using putItem
  const handleSaveCase = (updatedCaseData: Partial<CaseType>) => { // Renamed from handleSaveMatter
    if (!caseId || !currentMatter) return;

    const caseToSave: CaseType = {
      ...currentMatter,
      ...updatedCaseData,
      id: caseId,
      updatedAt: new Date(), // Ensure this is compatible with CaseType
    } as CaseType;

    putItem('cases', caseToSave)
      .then(() => {
        setCurrentMatter(caseToSave);
        toast.success("Case details saved successfully.");
      })
      .catch(error => {
        console.error("Error saving case:", error);
        toast.error("Failed to save case details.");
      });
  };


  // Format date
  const formatDate = (dateString: string | undefined | Date) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
  };

  // Helper function to get the appropriate icon based on file type
  const getFileIcon = (item: CaseFileMetadata) => {
    if (item.itemType === 'folder') {
        return <Folder className="h-5 w-5 text-amber-500" />;
    }
    switch (item.fileType?.split('/')[1]?.toUpperCase()) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'DOCX':
      case 'DOC':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'XLSX':
      case 'XLS':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'PNG':
      case 'JPG':
      case 'JPEG':
      case 'GIF':
        return <FileText className="h-5 w-5 text-purple-500" />; 
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Breadcrumb navigation handler
  const handleBreadcrumbClick = (folderId: string | null, index: number) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  // File/Folder click handler
  const handleItemClick = (item: CaseFileMetadata) => {
    if (item.itemType === 'folder') {
      setCurrentFolderId(item.id);
      setBreadcrumbs(prev => [...prev, { id: item.id, name: item.name }]);
    } else {
      // Handle file click (e.g., open preview or download)
      toast.info(`Clicked on file: ${item.name}`);
    }
  };

  if (isLoading) {
    return <Layout><div className="p-6">Loading case details...</div></Layout>;
  }

  if (error || !currentMatter) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-2xl font-bold mb-2">{error || "Case Not Found"}</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => navigate('/case-files')}>Back to Case Files</Button>
        </div>
      </Layout>
    );
  }

  // Now use currentMatter for rendering
  const caseDetails = currentMatter;
  

  return (
    <Layout>
      <div className="flex flex-col space-y-6 p-4 md:p-6"> {/* Added padding */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/case-files">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{caseDetails.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              {/* Removed caseDetails.type as it's not in the imported MatterType */}
              <span className="mr-2">•</span>
              <span>{caseDetails.status}</span>
               <span className="mr-2 ml-2">•</span> {/* Added separator */}
               <span>Case ID: {caseDetails.id}</span> {/* Display ID */}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Added Intake Form Tab */}
          <TabsList className="grid grid-cols-6 w-full"> {/* Adjusted grid columns */}
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="intake">Intake Form</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="meetingNotes">Meeting Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Case Overview</CardTitle>
                <CardDescription>
                  Details and status of the case.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentMatter && (
                  <CaseDetails // Use CaseDetails component
                    case={currentMatter} 
                    onSave={handleSaveCase} // Pass the save handler
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intake Form Tab */}
          <TabsContent value="intake">
            <Card>
              <CardHeader>
                <CardTitle>Client Intake Form</CardTitle>
                <CardDescription>
                  Review and edit the client intake form details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentMatter && (
                  <CaseDetails // Corrected from MatterDetails
                    case={currentMatter}
                    onSave={handleSaveCase} // Corrected from handleSaveMatter
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab - Updated to use displayedItems state */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            {/* Breadcrumbs will go here */}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id ?? 'root'}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <button
                    onClick={() => handleBreadcrumbClick(crumb.id, index)}
                    className={`hover:text-primary ${index === breadcrumbs.length - 1 ? 'font-medium text-foreground' : ''}`}
                    disabled={index === breadcrumbs.length - 1}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">
                {breadcrumbs[breadcrumbs.length - 1].name} {/* Show current folder name */}
              </h2>
              {/* TODO: Add Folder/Document buttons */}
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {isLoadingFiles ? (
                  <div className="p-6 text-center text-muted-foreground">Loading items...</div>
                ) : (
                  <div className="divide-y">
                    {displayedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleItemClick(item)} // Add click handler
                      >
                        {/* <div className="flex items-center">
                          {getFileIcon(item)}
                          <div className="ml-3">
                            <p className="text-sm font-medium">{item.name}</p>
                            <div className="flex items-center text-xs text-muted-foreground space-x-2">
                              {item.itemType === 'file' && (
                                <>
                                  <span>{formatDate(item.updatedAt?.toISOString())}</span>
                                  <span>•</span>
                                  <span>{item.fileType || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : 'N/A'}</span>
                                </>
                              )}
                              {item.itemType === 'folder' && (
                                <span>Folder</span>
                              )}
                            </div>
                          </div>
                        </div> */}
                        {/* TODO: Add item actions (rename, delete, etc.) */}
                        <Button variant="ghost" size="icon">
                          <FileIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {!isLoadingFiles && displayedItems.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground">
                        <p>This folder is empty.</p>
                        {/* TODO: Add Folder/Document buttons */}
                        <Button variant="link" className="mt-2">
                          + Add Item
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab - TODO: Fetch tasks from DB */}
          <TabsContent value="tasks" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Tasks</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>Task list not yet implemented.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meeting Notes Tab - TODO: Fetch notes from DB */}
          <TabsContent value="meetingNotes" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Meeting Notes</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>Meeting notes list not yet implemented.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CaseDetailPage;

// TODO: Implement handleItemClick and handleBreadcrumbClick for folder navigation
// TODO: Implement Add Item functionality (create folder/upload file)
// TODO: Implement item actions (rename, delete, move)
// TODO: Fetch and display Tasks and Meeting Notes from DB in their respective tabs
// TODO: Update MatterDetails component to align with imported MatterType if necessary
