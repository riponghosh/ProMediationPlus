import React from "react";
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Clock, 
  FileCheck, 
  CheckSquare, 
  ChevronRight 
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getItem } from "@/services/localDbService";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Case as CaseType } from "@/types/models";

const CaseFileSummaryPage = () => {
  const { id: caseId } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCase = async () => {
      if (!caseId) {
        setError("No case ID provided.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const loadedCaseData = await getItem('cases', caseId);
        if (loadedCaseData) {
          setCaseData(loadedCaseData as CaseType);
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
        setIsLoading(false);
      }
    };
    
    loadCase();
  }, [caseId]);

  if (isLoading) {
    return <Layout><div className="p-6">Loading case summary...</div></Layout>;
  }

  if (error || !caseData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-2xl font-bold mb-2">{error || "Case Not Found"}</h1>
          <p className="text-muted-foreground mb-4">The case you're looking for doesn't exist or couldn't be loaded.</p>
          <Button asChild>
            <Link to="/case-files">Back to Case Files</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{caseData.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{caseData.status}</span>
            <span className="mx-2">•</span>
            <span>Case ID: {caseData.caseFileNumber || caseData.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Client Details Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Client Details
              </CardTitle>
              <CardDescription>
                Client information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                View and manage client personal information, contact details, and related parties.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/case-files/${caseId}/client-details`}>
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Meetings Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
                Meetings
              </CardTitle>
              <CardDescription>
                Schedule and manage meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Create, view and manage all meetings related to this case, including agendas and notes.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/case-files/${caseId}/meetings`}>
                  View Meetings
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Forms Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2 text-amber-500" />
                Forms
              </CardTitle>
              <CardDescription>
                Case-related forms and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Access intake forms, agreements to mediate, and other important documentation.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/case-files/${caseId}/forms`}>
                  View Forms
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Timeline Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                Timeline
              </CardTitle>
              <CardDescription>
                Case progression timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                View a chronological timeline of case events, milestones, and important dates.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/case-files/${caseId}/timeline`}>
                  View Timeline
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Templates Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-red-500" />
                Templates
              </CardTitle>
              <CardDescription>
                Document templates for this case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Access and use document templates specific to this case type.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/case-files/${caseId}/templates`}>
                  View Templates
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Checklist Card */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-teal-500" />
                Checklist
              </CardTitle>
              <CardDescription>
                Case progress checklist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Track required tasks and procedural steps for this case.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/case-files/${caseId}/checklist`}>
                  View Checklist
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CaseFileSummaryPage;