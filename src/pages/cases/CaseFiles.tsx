import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, Calendar, Briefcase, Plus, Search, Filter, Trash, Download, Share2, ChevronDown, ChevronUp } from "lucide-react";
// Corrected import paths
import { CreateCaseDialog } from "@/components/dialogs/create-case-dialog";
import { EditCaseDialog } from "@/components/dialogs/edit-case-dialog";
import { CaseDetails } from "@/components/cases/CaseDetails"; // Corrected casing
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getAllItems, putItem, deleteItem, getNotesForCase } from "@/services/localDbService";
import { useIsMobile } from "@/hooks/use-mobile";
import { Case as CaseType } from "@/types/models"; // Import CaseType
import { createCase, deleteCase, getCases } from "@/api/CaseServices";

// Removed local Case interface, will use CaseType from models.ts

// Mock data (only used if local storage is empty) - IDs are now strings
// Updated to use CaseType and match its property names
const initialCasesData: { [key: string]: CaseType } = {
  "Case-1": {
    id: "Case-1",
    title: "Smith vs. Johnson",
    type: "Divorce Mediation",
    status: "Active",
    lastUpdated: "2023-06-15",
    clientName: "John Smith",
    description: "Divorce mediation Case involving property division and custody arrangements.",
    caseFileNumber: "CF-2023-001",
    caseFileName: "Smith-Johnson Divorce Case File",
    parties: ["John Smith", "Sarah Johnson"], // Changed from participants to parties
    // Added missing required fields from CaseType, assuming default/empty values
    email: "",
    phone: "",
    address: "",
    // intakeForm is optional in CaseType
  },
  "Case-2": {
    id: "Case-2",
    title: "Property Dispute Resolution",
    type: "Property Dispute",
    status: "Active",
    lastUpdated: "2023-06-16",
    clientName: "Sarah Johnson",
    description: "Boundary dispute between neighboring properties.",
    caseFileNumber: "CF-2023-002",
    caseFileName: "Johnson Property Dispute File",
    parties: ["Sarah Johnson", "Michael Brown"], // Changed from participants to parties
    email: "",
    phone: "",
    address: "",
  },
   "Case-3": {
    id: "Case-3",
    title: "Brown Employment Dispute",
    type: "Employment",
    status: "Active",
    lastUpdated: "2023-06-10",
    clientName: "Robert Brown",
    description: "Workplace discrimination claim against employer.",
    caseFileNumber: "CF-2023-003",
    caseFileName: "Brown Employment Case File",
    parties: ["Robert Brown", "Tech Solutions HR"], // Changed from participants to parties
    email: "",
    phone: "",
    address: "",
  },
   "Case-4": {
    id: "Case-4",
    title: "Wilson Family Mediation",
    type: "Family Dispute",
    status: "Pending",
    lastUpdated: "2023-06-05",
    clientName: "Emma Wilson",
    description: "Family inheritance dispute between siblings.",
    caseFileNumber: "CF-2023-004",
    caseFileName: "Wilson Family Mediation File",
    parties: ["Emma Wilson", "David Wilson"], // Changed from participants to parties
    email: "",
    phone: "",
    address: "",
  },
   "Case-5": {
    id: "Case-5",
    title: "Corporate Contract Negotiations",
    type: "Contract",
    status: "Closed",
    lastUpdated: "2023-05-20",
    clientName: "Tech Solutions Inc.",
    description: "Negotiation of service agreement between two businesses.",
    caseFileNumber: "CF-2023-005",
    caseFileName: "Tech Solutions Contract File",
    parties: ["Tech Solutions Rep", "Client Co Rep"], // Changed from participants to parties
    email: "",
    phone: "",
    address: "",
  }
};
const CaseFilesPage = () => {
  const [cases, setCases] = useState<{ [key: string]: CaseType }>({}); // Use CaseType
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();



  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [selectedCaseDetailId, setSelectedCaseDetailId] = useState<string | null>("Case-1"); 
  const [notes, setNotes] = useState<any[]>([]); // Assuming notes structure is flexible for now
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 

    // Load Cases from IndexedDB on initial render
  const loadCases = async () => {
    setIsLoading(true);
    try {
      const res = await getCases({
        page: page,
        limit: 10,
        status: activeTab === "all" ? "" : activeTab, // Status manage korun
        search: searchTerm,
      });

      const casesArray = res.data || [];
      
      if (res.meta) {
        setTotalPages(res.meta.totalPage || 1);
      }

      const casesObject = casesArray.reduce((acc: any, item: CaseType) => {
        acc[item.id] = item;
        return acc;
      }, {});

      setCases(casesObject);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cases");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [activeTab, searchTerm, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    if (!selectedCaseDetailId) {
      setNotes([]);
      return;
    }
    getNotesForCase(selectedCaseDetailId)
      .then(setNotes)
      .catch((error) => {
        console.error("Failed to load notes:", error);
        setNotes([]);
      });
  }, [selectedCaseDetailId]);

  const formatDate = (dateString: string | undefined) => {
     if (!dateString) return "N/A";
     try {
         const date = new Date(dateString);
         if (isNaN(date.getTime())) return "Invalid Date";
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

  const casesArray = Object.values(cases);

  const filteredCases = casesArray.filter(currentCase => {
    if (!currentCase) return false;
    const matchesSearch =
      searchTerm === "" ||
      currentCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currentCase.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currentCase.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currentCase.caseFileNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "active") return matchesSearch && currentCase.status === "active";
    if (activeTab === "on-hold") return matchesSearch && currentCase.status === "on-hold";
    if (activeTab === "closed") return matchesSearch && currentCase.status === "closed";

    return false;
  });

  const toggleSelectCase = (id: string) => {
    setSelectedCases(prev =>
      prev.includes(id)
        ? prev.filter(caseId => caseId !== id)
        : [...prev, id]
    );
  };

  const toggleCaseDetails = (id: string) => {
    setSelectedCaseDetailId(prev => prev === id ? null : id);
  };

  const handleSaveCase = async (updatedCaseData: CaseType) => {
    try {
      const caseToSave: CaseType = {
        ...updatedCaseData,
        lastUpdated: new Date().toISOString(),
      };
      await putItem('cases', caseToSave);
      setCases(prev => ({
        ...prev,
        [caseToSave.id]: caseToSave,
      }));
      toast.success("Case file updated");
    } catch (error) {
      console.error('Error saving Case to IndexedDB:', error);
      toast.error('Failed to save Case file');
    }
  };

  const handleDeleteCase = async (id: string) => {
    try {
      await deleteCase(id);
      setCases(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setSelectedCases(prev => prev.filter(caseId => caseId !== id));
      if (selectedCaseDetailId === id) {
        setSelectedCaseDetailId(null);
      }
      loadCases(); // Refresh the list after deletion
      toast.success("Case file deleted successfully");
    } catch (error) {
      console.error(`Error deleting Case ${id} from IndexedDB:`, error);
      toast.error("Failed to delete Case file");
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedCases.length;
    if (count === 0) return;

    const deletePromises = selectedCases.map(id => deleteItem('cases', id));

    try {
      await Promise.all(deletePromises);
      setCases(prev => {
        const newState = { ...prev };
        selectedCases.forEach(id => {
          delete newState[id];
        });
        return newState;
      });
      if (selectedCaseDetailId && selectedCases.includes(selectedCaseDetailId)) {
        setSelectedCaseDetailId(null);
      }
      toast.success(`${count} Case file${count > 1 ? 's' : ''} deleted`);
      setSelectedCases([]);
    } catch (error) {
      console.error('Error during bulk delete from IndexedDB:', error);
      toast.error("Failed to delete selected Case files");
    }
  };

  const handleShareCase = (id: string) => {
    const currentCase = cases[id];
    if (currentCase) {
      navigator.clipboard.writeText(`${window.location.origin}/case-files/${id}`) // Corrected path
        .then(() => toast.success(`Link for "${currentCase.title}" copied to clipboard.`))
        .catch(() => toast.error("Failed to copy link."));
    }
  };

  const handleDownloadCase = (id: string) => {
    const currentCase = cases[id];
    if (currentCase) {
      const caseData = JSON.stringify(currentCase, null, 2);
      const blob = new Blob([caseData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentCase.title?.replace(/[\s\/]/g, '_') || 'Case'}_file_${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded Case file: ${currentCase.title}`);
    }
  };

  // Updated to map CreateCaseDialog form values to CaseType
 const handleCreateCase = async (formData: {
  title: string;
  type: string;
  clientName: string;
  caseFile: string;
}) => {
  try {
    const payload = {
      title: formData.title,
      caseFileNumber: formData.caseFile,
      type: formData.type,
      clientName: formData.clientName,
      description: "",
      parties: [formData.clientName],
      email: "",
      phone: "",
      address: "",
      intakeForm: {},
      caseFileName: formData.caseFile,
    };

    const res = await createCase(payload);

    // ⚡ UI instantly update (optional but good UX)
    const newCase = res.data;

    setCases(prev => ({
      ...prev,
      [newCase.id]: newCase,
    }));

    toast.success("Case file created successfully");

  } catch (error: any) {
    console.error(error);
    // toast.error(error?.message || "Failed to create case");
  }
};

const activeCount = Object.values(cases).filter(c => c.status === "active").length;
const onHoldCount = Object.values(cases).filter(c => c.status === "on-hold").length;
const closedCount = Object.values(cases).filter(c => c.status === "closed").length;

  return (
    <Layout>
      <div className="flex flex-col space-y-4 p-2 md:space-y-6 md:p-6">
        {/* Header: Title, description, Delete selected, CreateCaseDialog */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Case Files</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage all your legal Cases and Cases
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {selectedCases.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto" size={isMobile ? "sm" : "default"}>
                    <Trash className={`${isMobile ? "h-3 w-3 mr-1" : "mr-2 h-4 w-4"}`} />
                    Delete ({selectedCases.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the selected {selectedCases.length} Case file(s).
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {handleDeleteCase(selectedCases[0]); setSelectedCases([]);}} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {/* CreateCaseDialog: onSave now directly calls handleCreateCase, showTrigger is true by default */}
            <CreateCaseDialog 
              onSave={handleCreateCase} 
              loadCases={loadCases}
              showTrigger={true} 
            />
          </div>
        </div>

        {/* Search and Filter buttons */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={isMobile ? "Search..." : "Search by title, client, type, Case number..."}
              className="w-full bg-background py-2 pl-8 pr-4 text-sm border rounded-md h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" 
            className="flex gap-2 w-full md:w-auto h-10"
            size={isMobile ? "sm" : "default"}>
            <Filter className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            Filter
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full"> {/* Changed from grid grid-cols-3 */}
            <TabsTrigger value="active" className={`flex-1 ${isMobile ? "text-xs py-1.5" : ""}`}>
              Active {activeCount > 0 && `(${activeCount})`}
            </TabsTrigger>
            <TabsTrigger value="on-hold" className={`flex-1 ${isMobile ? "text-xs py-1.5" : ""}`}>
              Pending {onHoldCount > 0 && `(${onHoldCount})`}
            </TabsTrigger>
            <TabsTrigger value="closed" className={`flex-1 ${isMobile ? "text-xs py-1.5" : ""}`}>
              Closed {closedCount > 0 && `(${closedCount})`}
            </TabsTrigger>
          </TabsList>

          {/* Unified TabsContent for all tabs */}
          <TabsContent value={activeTab} className="mt-4 md:mt-6">
            {isLoading ? (
              <p>Loading cases...</p>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredCases.length > 0 ? (
                      filteredCases.map((currentCase) => (
                        <div key={currentCase.id}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-4 hover:bg-muted/50 transition-colors">
                            {/* Case summary part */}
                            <div className="flex items-start flex-grow mb-2 sm:mb-0">
                              <Checkbox
                                checked={selectedCases.includes(currentCase.id)}
                                onCheckedChange={() => toggleSelectCase(currentCase.id)}
                                className="mr-2 sm:mr-3 mt-1 flex-shrink-0"
                                aria-label={`Select case ${currentCase.title}`}
                              />
                              <Briefcase className={`h-4 sm:h-5 w-4 sm:w-5 mt-0.5 flex-shrink-0 ${
                                currentCase.status === "active" ? "text-blue-500" :
                                currentCase.status === "on-hold" ? "text-amber-500" : "text-gray-500"
                              }`} />
                              <div className="ml-2 sm:ml-3 flex-grow">
                                <Link to={`/case-files/${currentCase.id}/summary`} className={`${isMobile ? "text-sm" : "text-base"} font-medium hover:underline cursor-pointer text-blue-600`}>
                                  {currentCase.title || "Untitled Case"}
                                </Link>
                                <div className={`flex items-center ${isMobile ? "text-xs" : "text-sm"} text-muted-foreground space-x-1 sm:space-x-2 mt-0.5 sm:mt-1 flex-wrap`}>
                                  <span>{currentCase.type || "N/A"}</span>
                                  <span className="mx-1">•</span>
                                  <span>{currentCase.clientName || "N/A"}</span>
                                  <span className="mx-1">•</span>
                                  {currentCase.caseFileNumber ? (
                                    <Link
                                      to={`/case-files/${currentCase.id}/summary`}
                                      className="text-blue-600 hover:underline"
                                      title={`View Case Summary for ${currentCase.caseFileNumber}`}
                                    >
                                      {currentCase.caseFileNumber}
                                    </Link>
                                  ) : (
                                    <span>N/A</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Action buttons part */}
                            <div className="flex items-center text-xs text-muted-foreground ml-auto sm:ml-4 flex-shrink-0 mt-2 sm:mt-0">
                              <span className="mr-2 hidden md:inline">Last updated: {formatDate(currentCase.lastUpdated)}</span>
                              <div className="flex items-center space-x-0">
                                <Button variant="ghost" size="icon" onClick={() => handleShareCase(currentCase.id)} title="Share Case File" className={`${isMobile ? "h-7 w-7" : "h-8 w-8"}`}>
                                  <Share2 className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDownloadCase(currentCase.id)} title="Download Case File" className={`${isMobile ? "h-7 w-7" : "h-8 w-8"}`}>
                                  <Download className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                                </Button>
                                <EditCaseDialog
                                  caseItem={currentCase}
                                  loadCases={loadCases}
                                  onSave={handleSaveCase}
                                />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className={`${isMobile ? "h-7 w-7" : "h-8 w-8"} text-destructive hover:text-destructive`}>
                                      <Trash className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className={isMobile ? "max-w-[90vw] p-4" : ""}>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the case file "{currentCase.title}". This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCase(currentCase.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleCaseDetails(currentCase.id)}
                                  title={selectedCaseDetailId === currentCase.id ? "Hide Details" : "Show Details"}
                                  className={`${isMobile ? "h-7 w-7" : "h-8 w-8"}`}
                                >
                                  {selectedCaseDetailId === currentCase.id ? <ChevronUp className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} /> : <ChevronDown className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {selectedCaseDetailId === currentCase.id && currentCase && (
                            <div className="border-t bg-muted/20 p-4">
                              <CaseDetails case={currentCase} onSave={handleSaveCase} />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium">No case files found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Get started by creating a new case file.
                        </p>
                        <div className="mt-6">
                          <CreateCaseDialog 
                            onSave={handleCreateCase}
                            showTrigger={true} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>                
              </Card>
            )}
            {/* Pagination */}
            <div className="flex justify-end mt-4 items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>

              <span className="text-sm px-2">
                Page <strong>{page}</strong> of {totalPages}
              </span>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                disabled={page === totalPages || isLoading}
              >
                Next
              </Button>
            </div>

            
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
};

export default CaseFilesPage;