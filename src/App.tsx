import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Index";
import CalendarPage from "./pages/Calendar";
import Email from "./pages/Email";
import NewSessionPage from "./pages/NewSession";
import NotesPage from "./pages/Notes";
import NewNotePage from "./pages/NewNote";
import TemplatesPage from "./pages/templates/Templates";
import StoragePage from "./pages/Storage";
import CaseFilesPage from "./pages/cases/CaseFiles";
import CaseDetailPage from "./pages/cases/CaseDetail";
import CaseFileSummaryPage from "./pages/cases/CaseFileSummary";
import ChecklistPage from "./pages/cases/ChecklistPage";
import FormsPage from "./pages/FormsPage";
import TimelinePage from "./pages/cases/TimelinePage";
import MeetingsPage from "./pages/cases/MeetingsPage";
import ClientDetailsPage from "./pages/cases/ClientDetailsPage";
import TasksPage from "./pages/Tasks";
import MeetingNotesPage from "./pages/MeetingNotes";
import ContactsPage from "./pages/Contacts";
import BillingPage from "./pages/Billing";
import DocumentsPage from "./pages/Documents";
import ReportsPage from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import GuidesPage from "./pages/guides/GuidesPage";
import GuidesGettingStarted from "./pages/guides/GuidesGettingStarted";
import GuidesBusinessSetUp from "./pages/guides/GuidesBusinessSetUp"; // Added import
import GuidesGrowYourBusiness from "./pages/guides/GuidesGrowYourBusiness"; // Added import
import GuidesMediateSuccess from "./pages/guides/GuidesMediateSuccess"; // Added import
import { MediationAgreementBuilder } from "./pages/agreements/MediationAgreement";
import { ParentingAgreementBuilder } from "./pages/agreements/ParentingAgreement";
import { SeparationAgreementBuilder } from "./pages/agreements/SeperationAgreement";
import NotFound from "./pages/NotFound";
import CalendlyCallbackPage from "./pages/CalendlyCallbackPage"; // Added import

// Admin section imports
import AdminLayout from "./components/layout/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AllCasesListPage from "./pages/admin/AllCasesListPage";
import DataImportExportPage from "./pages/admin/DataImportExportPage";
import GuidesManagementPage from "./pages/admin/GuidesManagementPage";
import GuidesAdminGettingStarted from "./pages/admin/guides/GuidesAdminGettingStarted";
import AuditLogPage from "./pages/admin/AuditLogPage";
import SystemStatusPage from "./pages/admin/SystemStatusPage";
import PlanManagementPage from "./pages/admin/PlanManagementPage";
import SubscriptionOverviewPage from "./pages/admin/SubscriptionOverviewPage";
import InvoiceManagementPage from "./pages/admin/InvoiceManagementPage";
import StripeSettingsPage from "./pages/admin/StripeSettingsPage";
import HubspotPage from "./pages/admin/HubspotPage";
import OpenAIPage from "./pages/admin/OpenAIPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import AdminTemplatesPage from "./pages/admin/TemplatesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main app routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/email" element={<Email />} /> {/* Add route for Email */}
          <Route path="/calendar/new" element={<NewSessionPage />} />
          <Route path="/case-files" element={<CaseFilesPage />} />
          <Route path="/case-files/:id" element={<CaseDetailPage />} />
          <Route path="/case-files/:id/summary" element={<CaseFileSummaryPage />} /> {/* Add route for CaseFileSummaryPage */}
          <Route path="/case-files/:id/checklist" element={<ChecklistPage />} /> {/* Add route for ChecklistPage */}
          <Route path="/case-files/:id/forms" element={<FormsPage />} /> {/* Add route for FormsPage */}
          <Route path="/case-files/:id/timeline" element={<TimelinePage />} /> {/* Add route for TimelinePage */}
          <Route path="/case-files/:id/meetings" element={<MeetingsPage />} /> {/* Add route for MeetingsPage */}
          <Route path="/case-files/:id/client-details" element={<ClientDetailsPage />} /> {/* Add route for ClientDetailsPage */}
          <Route path="/case-files/:id/notes" element={<NotesPage />} /> {/* Add route for case-specific NotesPage */}
          <Route path="/case-files/:id/templates" element={<TemplatesPage />} /> {/* Add route for case-specific Templates */}
          <Route path="/cases" element={<Navigate to="/case-files" replace />} />
          <Route path="/cases/:id" element={<Navigate to="/case-files/:id" replace />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/meeting-notes" element={<MeetingNotesPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/new" element={<NewNotePage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/storage" element={<StoragePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/activities" element={<GuidesPage />} /> {/* Placeholder for Activities page */}
          <Route path="/guides" element={<GuidesPage />} /> {/* Add route for GuidesPage */}
          <Route path="/guides/getting-started" element={<GuidesGettingStarted />} /> {/* Add route for GuidesGettingStarted */}
          <Route path="/guides/business-set-up" element={<GuidesBusinessSetUp />} /> {/* Add route for GuidesBusinessSetUp */}
          <Route path="/guides/grow-your-business" element={<GuidesGrowYourBusiness />} /> {/* Add route for GuidesGrowYourBusiness */}
          <Route path="/guides/mediate-success" element={<GuidesMediateSuccess />} /> {/* Add route for GuidesMediateSuccess */}
          <Route path="/mediation-template" element={<MediationAgreementBuilder />} /> {/* Add route for MediationAgreementBuilder */}
          <Route path="/parenting-template" element={<ParentingAgreementBuilder />} /> {/* Add route for ParentingAgreementBuilder */}
          <Route path="/separation-template" element={<SeparationAgreementBuilder />} /> {/* Add route for SeparationAgreementBuilder */}
          <Route path="/calendly/callback" element={<CalendlyCallbackPage />} /> {/* Added Calendly callback route */}
          
          {/* Admin routes with AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            
            {/* User Management */}
            <Route path="users" element={<UserManagementPage />} />
            {/* Consolidating user management into a tabbed interface */}
            
            {/* Case/Data Oversight */}
            <Route path="cases/all" element={<AllCasesListPage />} />
            <Route path="data/import-export" element={<DataImportExportPage />} />
            
            {/* Content & Configuration */}
            <Route path="content/templates" element={<AdminTemplatesPage />} />
            {/* Document and email templates consolidated into a single Templates page */}
            <Route path="content/guides" element={<GuidesManagementPage />} />
            <Route path="guides/getting-started" element={<GuidesAdminGettingStarted />} />
            {/* Branding route removed - now part of Settings page */}
            
            {/* Monitoring & Logs */}
            <Route path="monitoring/audit-log" element={<AuditLogPage />} />
            <Route path="monitoring/system-status" element={<SystemStatusPage />} />
            {/* Error log route removed - functionality moved to Audit Log page */}
            
            {/* Billing & Subscriptions */}
            <Route path="billing/plans" element={<PlanManagementPage />} />
            <Route path="billing/subscriptions" element={<SubscriptionOverviewPage />} />
            <Route path="billing/invoices" element={<InvoiceManagementPage />} />
            <Route path="billing/stripe-settings" element={<StripeSettingsPage />} />
            
            {/* Integrations & Settings */}
            <Route path="openai" element={<OpenAIPage />} />
            <Route path="hubspot" element={<HubspotPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;