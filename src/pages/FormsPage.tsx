import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, FileText, Plus, Download, Check, Edit, DownloadCloud } from "lucide-react";
import { getItem, getAllItems } from "@/services/localDbService"; // Added getAllItems
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgreementToMediateForm } from "@/pages/forms/AgreementToMediateForm";
import { StatementOfMeansForm } from "@/pages/forms/StatementOfMeansForm";
import { ClientEnquiryForm } from "@/pages/forms/ClientEnquiryForm";
import { BillingForm } from "@/pages/forms/BillingForm";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TemplateBuilder, TemplateBuilderProps } from "@/pages/forms/FormBuilder"; // Import TemplateBuilderProps
import type { Case } from "@/types/models"; // Import Case type
import { getCaseById } from "@/api/CaseServices";

const availableForms = [
  {
    id: "agreement-to-mediate",
    title: "Agreement to Mediate",
    description: "Standard agreement to mediate template",
    status: "required",
    category: "mandatory",
    progress: 0,
    componentName: "AgreementToMediateForm"
  },
  {
    id: "statement-of-means",
    title: "Statement of Means",
    description: "Financial disclosure form for divorce cases",
    status: "optional",
    category: "financial",
    progress: 0,
    componentName: "StatementOfMeansForm"
  },
  {
    id: "client-enquiry",
    title: "Client Enquiry Form",
    description: "Initial client information form",
    status: "completed",
    category: "intake",
    progress: 100,
    componentName: "ClientEnquiryForm"
  },
  {
    id: "billing-details",
    title: "Billing Details",
    description: "Client billing information form",
    status: "in-progress",
    category: "financial",
    progress: 60,
    componentName: "BillingForm"
  }
];

const FormsPage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [currentForm, setCurrentForm] = useState<any>(null);
  const isMobile = useIsMobile();
  const [formBuilderOpen, setFormBuilderOpen] = useState(false);
  const [savedForms, setSavedForms] = useState<any[]>([]); // Added state for saved forms

  // Function to reload saved forms
  const loadSavedForms = async () => {
    try {
      const formsFromDb = await getAllItems("forms");
      console.log("Forms loaded from DB:", formsFromDb); // Log loaded forms
      setSavedForms(formsFromDb);
    } catch (e) {
      console.error("Error loading saved forms:", e);
      toast.error("Failed to load saved forms.");
    }
  };

  useEffect(() => {
    loadSavedForms(); // Initial load

    // Only attempt to load case if caseId is provided
    const loadCase = async () => {
      if (!caseId) {
        // If no caseId, we might be on a general forms page, not an error
        setLoading(false); 
        return;
      }
      
      setLoading(true);
      try {
        const fetchedCaseData = await getCaseById(caseId);
        if (fetchedCaseData.data) {
          setCaseData(fetchedCaseData.data as Case); 
          setError(null);
        } else {
          setError("Case not found.");
          setCaseData(null);
        }
      } catch (e) {
        console.error("Error loading case data:", e);
        setError("Failed to load case data.");
        setCaseData(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadCase(); // Renamed from loadMatter to loadCase
  }, [caseId]);

  const handleFormOpen = (form: any) => {
    setCurrentForm(form);
  };

  const renderFormComponent = (formId: string) => {
    const currentCaseId = caseId || "";

    switch (formId) {
      case "agreement-to-mediate":
        return <AgreementToMediateForm caseId={currentCaseId} />;
      case "statement-of-means":
        return <StatementOfMeansForm caseId={currentCaseId} />;
      case "client-enquiry":
        return <ClientEnquiryForm caseId={currentCaseId} />;
      case "billing-details":
        return <BillingForm caseId={currentCaseId} />;
      default:
        const savedForm = savedForms.find(form => form.id === formId || form.formTitle === formId);
        if (savedForm) {
          const templateBuilderProps: TemplateBuilderProps = {
            initialData: savedForm,
            caseId: currentCaseId,
            formId: savedForm.id, // Pass the formId for editing
            onFormUpdate: (updatedData) => { // Handle updates to existing forms
              console.log("Form updated via TemplateBuilder:", updatedData);
              loadSavedForms(); // Reload forms to reflect changes
              setCurrentForm(null); // Close the form dialog/modal
              setFormBuilderOpen(false); // Close form builder if it's a separate modal
            },
            onFormSave: (newData) => { // Handle saving new forms (though less likely here if initialData is present)
              console.log("New form saved via TemplateBuilder:", newData);
              loadSavedForms(); // Reload forms
              setCurrentForm(null);
              setFormBuilderOpen(false);
            }
          };
          return <TemplateBuilder {...templateBuilderProps} />;
        }
        return <div className="p-4 text-center">Form not available</div>;
    }
  };

  const handleFormSave = () => { // This might be for forms not using TemplateBuilder or a general save action
    toast.success("Form saved successfully.");
    setCurrentForm(null);
    loadSavedForms(); // Ensure saved forms are reloaded
  };

  const handleFormCancel = () => {
    setCurrentForm(null);
  };

  const handleFormDownload = (formId: string) => {
    toast.success(`${formId} PDF downloaded successfully.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "required":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Required</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case "optional":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Optional</Badge>;
      default:
        return null;
    }
  };

  const filteredForms = activeTab === "all" 
    ? availableForms 
    : availableForms.filter(form => form.category === activeTab);

  if (loading) {
    return <Layout><div className="p-4 md:p-6">Loading forms...</div></Layout>;
  }

  // If a specific case was requested but couldn't be loaded, show error
  if (caseId && (error || !caseData)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold mb-2`}>{error || "Case Not Found"}</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or couldn't be loaded.</p>
          <Button size={isMobile ? "sm" : "default"} asChild>
            <Link to="/case-files">Back to Case Files</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} p-4 md:p-6`}>
        {/* Header - show different content based on whether we're in a case context or not */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            {caseId ? (
              <>
                <Button variant="outline" size="icon" asChild>
                  <Link to="/case-files">
                    <ChevronLeft className={iconSizeClass} />
                  </Link>
                </Button>
                <div>
                  <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Forms</h1>
                  {caseData && (
                    <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                      {caseData.title} • {caseData.caseFileNumber || caseData.id}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div>
                <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Forms</h1>
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  Manage all legal and client forms
                </p>
              </div>
            )}
          </div>
          <Button size={isMobile ? "sm" : "default"} onClick={() => setFormBuilderOpen(true)}>
            <Plus className={`${iconSizeClass} mr-1.5`} />
            {isMobile ? "New" : "New Form"}
          </Button>
        </div>

        {/* If a form is currently open, show it */}
        {currentForm ? (
          <Card>
            <CardHeader className={isMobile ? "p-4" : ""}>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className={isMobile ? "text-base" : ""}>{currentForm.title}</CardTitle>
                  <CardDescription>{currentForm.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={handleFormCancel}>Cancel</Button>
                  <Button size={isMobile ? "sm" : "default"} onClick={handleFormSave}>Save</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={isMobile ? "p-4 pt-0" : ""}>
              {renderFormComponent(currentForm.id)}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Form category tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="mandatory"
                  className={`
                    flex items-center justify-center gap-1.5
                    ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                    rounded-md
                    data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                  `}
                >
                  Mandatory
                </TabsTrigger>
                <TabsTrigger
                  value="intake"
                  className={`
                    flex items-center justify-center gap-1.5
                    ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                    rounded-md
                    data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                  `}
                >
                  Intake
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className={`
                    flex items-center justify-center gap-1.5
                    ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                    rounded-md
                    data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                  `}
                >
                  Financial
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className={`mt-${isMobile ? '3' : '4'}`}>
                <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-4'}`}>
                  {filteredForms.map(form => (
                    <Card key={form.id} className="transition-all hover:shadow-md">
                      <CardHeader className={`${isMobile ? "p-3" : "pb-2"}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className={`${isMobile ? "text-sm" : "text-lg"} flex items-center`}>
                              <FileText className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mr-2 text-blue-500`} />
                              {form.title}
                            </CardTitle>
                            <CardDescription className={isMobile ? "text-xs" : ""}>
                              {form.description}
                            </CardDescription>
                          </div>
                          {getStatusBadge(form.status)}
                        </div>
                      </CardHeader>
                      
                      <CardContent className={`${isMobile ? "px-3 py-1" : "pb-2"}`}>
                        {form.progress > 0 && (
                          <div className="space-y-1 mb-2">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{form.progress}%</span>
                            </div>
                            <Progress value={form.progress} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className={`flex justify-between ${isMobile ? "p-3 pt-1" : ""}`}>
                        {form.status === "completed" ? (
                          <Button variant="outline" className="w-full" size={isMobile ? "sm" : "default"} onClick={() => handleFormDownload(form.id)}>
                            <Download className={`${iconSizeClass} mr-1.5`} />
                            Download PDF
                          </Button>
                        ) : (
                          <Button 
                            className="w-full"
                            size={isMobile ? "sm" : "default"}
                            variant={form.status === "in-progress" ? "default" : "outline"}
                            onClick={() => handleFormOpen(form)}
                          >
                            {form.status === "in-progress" ? (
                              <>
                                <Edit className={`${iconSizeClass} mr-1.5`} />
                                {isMobile ? "Continue" : "Continue Editing"}
                              </>
                            ) : form.status === "completed" ? (
                              <>
                                <Check className={`${iconSizeClass} mr-1.5`} />
                                View Form
                              </>
                            ) : (
                              <>
                                <Plus className={`${iconSizeClass} mr-1.5`} />
                                {isMobile ? "Fill Out" : "Fill Out Form"}
                              </>
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}

                </div>
                
                {filteredForms.length === 0 && (
                  <div className={`text-center ${isMobile ? "p-4" : "p-6"} bg-muted rounded-md`}>
                    <p className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>No forms in this category</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Separator className="my-1.5" />
            
            {/* Template Forms Section */}
            <div>
              <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold mb-3`}>Saved Forms</h2>
              {savedForms.length > 0 ? (
                <div className={`grid grid-cols-1 ${isMobile ? "gap-3" : "md:grid-cols-3 gap-4"}`}>
                  {savedForms.map((form, index) => (
                    <Card key={index}>
                      <CardHeader className={`${isMobile ? "p-3" : "pb-2"}`}>
                        <CardTitle className={`${isMobile ? "text-sm" : "text-md"}`}>{form.formTitle || "Untitled Form"}</CardTitle>
                        <CardDescription className={isMobile ? "text-xs" : ""}>
                          {form.formDescription || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className={isMobile ? "p-3" : ""}>
                        <Button variant="outline" size={isMobile ? "sm" : "default"} className="w-full" onClick={() => handleFormOpen(form)}>
                          <Plus className={`${iconSizeClass} mr-1.5`} />
                          Use Form
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className={`text-center ${isMobile ? "p-4" : "p-6"} bg-muted rounded-md`}>
                  <p className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>No forms saved yet. Create a new form to see it here.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Form Builder Dialog */}
      <Dialog open={formBuilderOpen} onOpenChange={setFormBuilderOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
          </DialogHeader>
          <TemplateBuilder onFormSave={() => { 
              loadSavedForms(); // Reload forms after saving
              setFormBuilderOpen(false); // Close the dialog
            }} 
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default FormsPage;