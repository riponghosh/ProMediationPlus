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
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import VerifyEmail from "./pages/auth/VerifyEmail";
import PasswordReset from "./pages/auth/PasswordReset";
import SetNewPassword from "./pages/auth/SetNewPassword";
import TemplateRenderer from "./pages/templates/TemplateRenderer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main app routes */}
          {/* login */}
          <Route path="/login" element={<Login />} />
          {/* Sign up */}
          <Route path="/signup" element={<Signup />} />
          {/* Email Verify */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* Reset  */}
          <Route path="/password-reset" element={<PasswordReset />} />
          {/* Set New Password */}
          <Route path="/reset-password" element={<SetNewPassword />} />
          {/*  */}
          
          <Route path="/" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><CalendarPage /></ProtectedRoute>} />
          <Route path="/email" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><Email /></ProtectedRoute>} /> {/* Add route for Email */}
          <Route path="/calendar/new" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><NewSessionPage /></ProtectedRoute>} />
          <Route path="/case-files" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><CaseFilesPage /></ProtectedRoute>} />
          <Route path="/case-files/:id" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><CaseDetailPage /></ProtectedRoute>} />
          <Route path="/case-files/:id/summary" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><CaseFileSummaryPage /></ProtectedRoute>} /> {/* Add route for CaseFileSummaryPage */}
          <Route path="/case-files/:id/checklist" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><ChecklistPage /></ProtectedRoute>} /> {/* Add route for ChecklistPage */}
          <Route path="/case-files/:id/forms" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><FormsPage /></ProtectedRoute>} /> {/* Add route for FormsPage */}
          <Route path="/case-files/:id/timeline" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><TimelinePage /></ProtectedRoute>} /> {/* Add route for TimelinePage */}
          <Route path="/case-files/:id/meetings" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><MeetingsPage /></ProtectedRoute>} /> {/* Add route for MeetingsPage */}
          <Route path="/case-files/:id/client-details" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><ClientDetailsPage /></ProtectedRoute>} /> {/* Add route for ClientDetailsPage */}
          <Route path="/case-files/:id/templates" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><TemplatesPage /></ProtectedRoute>} /> 
          <Route path="/cases" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><Navigate to="/case-files" replace /></ProtectedRoute>} />
          <Route path="/cases/:id" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><Navigate to="/case-files/:id" replace /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><TasksPage /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><ContactsPage /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><BillingPage /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><DocumentsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><ReportsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><SettingsPage /></ProtectedRoute>} />
          <Route path="/meeting-notes" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><MeetingNotesPage /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><NotesPage /></ProtectedRoute>} />
          <Route path="/notes/new" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><NewNotePage /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><TemplatesPage /></ProtectedRoute>} />
          <Route path="/storage" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><StoragePage /></ProtectedRoute>} />
          <Route path="/forms" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><FormsPage /></ProtectedRoute>} />
          <Route path="/activities" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><GuidesPage /></ProtectedRoute>} /> {/* Placeholder for Activities page */}
          <Route path="/guides" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><GuidesPage /></ProtectedRoute>} /> {/* Add route for GuidesPage */}
          <Route path="/guides/getting-started" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><GuidesGettingStarted /></ProtectedRoute>} /> {/* Add route for GuidesGettingStarted */}
          <Route path="/guides/business-set-up" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><GuidesBusinessSetUp /></ProtectedRoute>} /> {/* Add route for GuidesBusinessSetUp */}
          <Route path="/guides/grow-your-business" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><GuidesGrowYourBusiness /></ProtectedRoute>} /> {/* Add route for GuidesGrowYourBusiness */}
          <Route path="/guides/mediate-success" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><GuidesMediateSuccess /></ProtectedRoute>} /> {/* Add route for GuidesMediateSuccess */}
          <Route path="/templates/:id" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><TemplateRenderer /></ProtectedRoute>} />
          <Route path="/mediation-template" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><MediationAgreementBuilder /></ProtectedRoute>} /> {/* Add route for MediationAgreementBuilder */}
          <Route path="/parenting-template" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><ParentingAgreementBuilder /></ProtectedRoute>} /> {/* Add route for ParentingAgreementBuilder */}
          <Route path="/separation-template" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><SeparationAgreementBuilder /></ProtectedRoute>} /> {/* Add route for SeparationAgreementBuilder */}
          <Route path="/calendly/callback" element={<ProtectedRoute allowedRoles={["Administrator", "Client", "Mediator"]}><CalendlyCallbackPage /></ProtectedRoute>} /> {/* Added Calendly callback route */}
          
          {/* Admin routes with AdminLayout */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["Administrator"]}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={["Administrator"]}><AdminDashboardPage /></ProtectedRoute>} />
            
            {/* User Management */}
            <Route path="users" element={<ProtectedRoute allowedRoles={["Administrator"]}><UserManagementPage /></ProtectedRoute>} />
            {/* Consolidating user management into a tabbed interface */}
            
            {/* Case/Data Oversight */}
            <Route path="cases/all" element={<ProtectedRoute allowedRoles={["Administrator"]}><AllCasesListPage /></ProtectedRoute>} />
            <Route path="data/import-export" element={<ProtectedRoute allowedRoles={["Administrator"]}><DataImportExportPage /></ProtectedRoute>} />
            
            {/* Content & Configuration */}
            <Route path="content/templates" element={<ProtectedRoute allowedRoles={["Administrator"]}><AdminTemplatesPage /></ProtectedRoute>} />
            {/* Document and email templates consolidated into a single Templates page */}
            <Route path="content/guides" element={<ProtectedRoute allowedRoles={["Administrator"]}><GuidesManagementPage /></ProtectedRoute>} />
            <Route path="guides/getting-started" element={<ProtectedRoute allowedRoles={["Administrator"]}><GuidesAdminGettingStarted /></ProtectedRoute>} />
            {/* Branding route removed - now part of Settings page */}
            
            {/* Monitoring & Logs */}
            <Route path="monitoring/audit-log" element={<ProtectedRoute allowedRoles={["Administrator"]}><AuditLogPage /></ProtectedRoute>} />
            <Route path="monitoring/system-status" element={<ProtectedRoute allowedRoles={["Administrator"]}><SystemStatusPage /></ProtectedRoute>} />
            {/* Error log route removed - functionality moved to Audit Log page */}
            
            {/* Billing & Subscriptions */}
            <Route path="billing/plans" element={<ProtectedRoute allowedRoles={["Administrator"]}><PlanManagementPage /></ProtectedRoute>} />
            <Route path="billing/subscriptions" element={<ProtectedRoute allowedRoles={["Administrator"]}><SubscriptionOverviewPage /></ProtectedRoute>} />
            <Route path="billing/invoices" element={<ProtectedRoute allowedRoles={["Administrator"]}><InvoiceManagementPage /></ProtectedRoute>} />
            <Route path="billing/stripe-settings" element={<ProtectedRoute allowedRoles={["Administrator"]}><StripeSettingsPage /></ProtectedRoute>} />
            
            {/* Integrations & Settings */}
            <Route path="openai" element={<ProtectedRoute allowedRoles={["Administrator"]}><OpenAIPage /></ProtectedRoute>} />
            <Route path="hubspot" element={<ProtectedRoute allowedRoles={["Administrator"]}><HubspotPage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={["Administrator"]}><AdminSettingsPage /></ProtectedRoute>} />
          </Route>
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;