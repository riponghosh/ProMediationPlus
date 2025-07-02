import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Users, Phone, Mail, MapPin, Edit, Plus, Save } from "lucide-react";
import { addItem } from "@/services/localDbService";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseDetails } from "@/components/cases/Caseform";
import type { Case as CaseType, Party } from "@/types/models";
import { v4 as uuidv4 } from 'uuid';

const ClientIntakePage = () => {
  const navigate = useNavigate();

  const initialCaseData: Partial<CaseType> = {
    id: uuidv4(),
    title: "",
    status: "Open",
    dateOpened: new Date().toISOString(),
    parties: [{ id: uuidv4(), name: "", type: "Client", contact: { email: "", phone: "" }, address: "" }] as Party[],
    description: "",
    caseFileNumber: `CASE-${Date.now()}`,
  };

  const [caseData, setCaseData] = useState<Partial<CaseType>>(initialCaseData);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  const handleSaveIntake = async (updatedIntakeDetails: Partial<CaseType>) => {
    setIsLoading(true);
    try {
      const newIntakeData: CaseType = {
        ...initialCaseData,
        ...caseData,
        ...updatedIntakeDetails,
        id: caseData.id || uuidv4(),
        lastUpdated: new Date().toISOString(),
        type: caseData.type || "Intake",
      } as CaseType;

      await addItem('cases', newIntakeData);
      setCaseData(newIntakeData);
      toast.success("Client intake created successfully");
      navigate(`/case-files/${newIntakeData.id}`);
    } catch (e) {
      console.error("Error creating client intake:", e);
      setError("Failed to create client intake.");
      toast.error("Failed to create client intake");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Layout><div className={`${isMobile ? "p-4" : "p-6"}`}>Saving intake...</div></Layout>;
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold mb-2`}>{error}</h1>
          <p className="text-muted-foreground mb-4">An error occurred while processing the intake form.</p>
          <Button size={isMobile ? "sm" : "default"} onClick={() => { setError(null); setCaseData(initialCaseData); /* Reset form */ }}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  // Props for CaseDetails component - assuming CaseDetails can handle Partial<CaseType> for new cases
  // and that its own props interface is defined within its file or inferred.
  const caseDetailsProps = {
    case: caseData as CaseType, // Corrected prop name from caseData to case
    onSave: handleSaveIntake,
    isNewCase: true,
  };

  return (
    <Layout>
      <div className={`flex flex-col h-full ${isMobile ? "space-y-3 p-4" : "space-y-6 p-6"}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size={isMobile ? "sm" : "icon"} onClick={() => navigate("/templates")}>
              <ChevronLeft className={iconSizeClass} />
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>New Client Intake</h1>
              <p className="text-muted-foreground text-sm">
                Fill in the details to create a new client intake record.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size={isMobile ? "sm" : "default"}
              onClick={() => handleSaveIntake(caseData)}
              disabled={isLoading}
            >
              <Save className={`mr-2 ${iconSizeClass}`} />
              {isLoading ? "Saving..." : "Save Intake"}
            </Button>
          </div>
        </div>

        <Separator />

        <CaseDetails {...caseDetailsProps} />
        
      </div>
    </Layout>
  );
};

export default ClientIntakePage;