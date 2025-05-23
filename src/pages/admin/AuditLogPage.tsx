import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { 
  Search, 
  Calendar as CalendarIcon,
  Download, 
  RefreshCw, 
  ChevronDown,
  UserCircle,
  FileEdit,
  Trash,
  UserPlus,
  Lock,
  Settings,
  CreditCard,
  Database,
  Eye,
  Info,
  ArrowRight,
  Filter,
  AlertTriangle,
  AlertCircle, 
  Copy,
  ClipboardList 
} from "lucide-react";

// Mock audit log data for demonstration
const auditLogs = [
  {
    id: "log-1",
    timestamp: new Date(2025, 3, 27, 10, 15, 43),
    action: "user.login",
    user: {
      id: "user-123",
      email: "john.smith@example.com",
      name: "John Smith"
    },
    details: {
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110",
      location: "New York, US"
    },
    resource: {
      type: "auth",
      id: null
    },
    changes: null
  },
  {
    id: "log-2",
    timestamp: new Date(2025, 3, 27, 9, 32, 17),
    action: "case.create",
    user: {
      id: "user-456",
      email: "sarah.johnson@example.com",
      name: "Sarah Johnson"
    },
    details: {
      ip: "192.168.1.2",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15"
    },
    resource: {
      type: "case",
      id: "case-789"
    },
    changes: null
  },
  {
    id: "log-3",
    timestamp: new Date(2025, 3, 26, 16, 45, 22),
    action: "user.update",
    user: {
      id: "user-123",
      email: "john.smith@example.com",
      name: "John Smith"
    },
    details: {
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110"
    },
    resource: {
      type: "user",
      id: "user-789"
    },
    changes: {
      role: {
        from: "mediator",
        to: "admin"
      },
      permissions: {
        from: ["read_cases", "update_cases"],
        to: ["read_cases", "update_cases", "delete_cases", "manage_users"]
      }
    }
  },
  {
    id: "log-4",
    timestamp: new Date(2025, 3, 26, 14, 20, 10),
    action: "document.delete",
    user: {
      id: "user-456",
      email: "sarah.johnson@example.com",
      name: "Sarah Johnson"
    },
    details: {
      ip: "192.168.1.2",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15"
    },
    resource: {
      type: "document",
      id: "doc-123",
      name: "Mediation Agreement.pdf"
    },
    changes: null
  },
  {
    id: "log-5",
    timestamp: new Date(2025, 3, 25, 11, 5, 38),
    action: "user.invite",
    user: {
      id: "user-123",
      email: "john.smith@example.com",
      name: "John Smith"
    },
    details: {
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110"
    },
    resource: {
      type: "user",
      id: null,
      email: "new.user@example.com"
    },
    changes: {
      role: "mediator",
      status: "invited"
    }
  },
  {
    id: "log-6",
    timestamp: new Date(2025, 3, 25, 9, 12, 55),
    action: "settings.update",
    user: {
      id: "user-123",
      email: "john.smith@example.com",
      name: "John Smith"
    },
    details: {
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110"
    },
    resource: {
      type: "settings",
      id: "general"
    },
    changes: {
      company_name: {
        from: "Mediation Services",
        to: "MediatorPro Services"
      },
      support_email: {
        from: "support@example.com",
        to: "help@example.com"
      }
    }
  },
  {
    id: "log-7",
    timestamp: new Date(2025, 3, 24, 16, 30, 15),
    action: "subscription.update",
    user: {
      id: "user-123",
      email: "john.smith@example.com",
      name: "John Smith"
    },
    details: {
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110"
    },
    resource: {
      type: "subscription",
      id: "sub-456"
    },
    changes: {
      plan: {
        from: "professional",
        to: "enterprise"
      },
      seats: {
        from: 5,
        to: 10
      }
    }
  },
  {
    id: "log-8",
    timestamp: new Date(2025, 3, 24, 10, 47, 29),
    action: "case.update",
    user: {
      id: "user-456",
      email: "sarah.johnson@example.com",
      name: "Sarah Johnson"
    },
    details: {
      ip: "192.168.1.2",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15"
    },
    resource: {
      type: "case",
      id: "case-123"
    },
    changes: {
      status: {
        from: "active",
        to: "closed"
      },
      resolution: {
        from: null,
        to: "settled"
      }
    }
  },
  {
    id: "log-9",
    timestamp: new Date(2025, 3, 23, 15, 5, 43),
    action: "payment.process",
    user: {
      id: "user-789",
      email: "david.miller@example.com",
      name: "David Miller"
    },
    details: {
      ip: "192.168.1.3",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/96.0.1054.62"
    },
    resource: {
      type: "payment",
      id: "pay-123"
    },
    changes: {
      status: {
        from: "pending",
        to: "completed"
      },
      amount: "$250.00"
    }
  },
  {
    id: "log-10",
    timestamp: new Date(2025, 3, 23, 9, 32, 17),
    action: "system.backup",
    user: {
      id: "system",
      email: null,
      name: "System"
    },
    details: {
      automated: true
    },
    resource: {
      type: "database",
      id: null
    },
    changes: {
      backup_size: "1.2GB",
      backup_location: "s3://mediatorpro-backups/2025-03-23/"
    }
  }
];

// Mock error logs data for demonstration
const errorLogs = [
  {
    id: "err-1",
    timestamp: new Date(2025, 3, 26, 14, 32, 11),
    message: "Failed to connect to Stripe API endpoint",
    source: "PaymentService.js:142",
    severity: "error",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/96.0.4664.110",
    userId: "user-123",
    details: `{
      "error": {
        "type": "api_connection_error",
        "message": "Network error connecting to api.stripe.com"
      },
      "request": {
        "method": "POST",
        "path": "/v1/payment_intents"
      }
    }`
  },
  {
    id: "err-2",
    timestamp: new Date(2025, 3, 26, 10, 15, 47),
    message: "Database query timeout",
    source: "CaseRepository.ts:89",
    severity: "error",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    userId: "user-456",
    details: `{
      "error": "Query execution was interrupted, maximum statement execution time exceeded",
      "query": "SELECT * FROM cases WHERE client_id = ? AND status IN (?) ORDER BY created_at DESC",
      "params": ["client-789", ["active", "pending"]],
      "timeout": 30000
    }`
  },
  {
    id: "err-3",
    timestamp: new Date(2025, 3, 25, 19, 5, 32),
    message: "Failed to load user profile",
    source: "UserProfileComponent.tsx:218",
    severity: "warning",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    userId: "user-789",
    details: `{
      "component": "UserProfileDetails",
      "props": {
        "userId": "user-789"
      },
      "error": "Failed to fetch user data from API"
    }`
  },
  {
    id: "err-4",
    timestamp: new Date(2025, 3, 25, 16, 42, 19),
    message: "Document upload failed: File too large",
    source: "DocumentUploadService.ts:56",
    severity: "warning",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/95.0",
    userId: "user-234",
    details: `{
      "filename": "client_agreement.pdf",
      "filesize": 25000000,
      "maxSize": 10000000,
      "uploadAttempt": 2
    }`
  },
  {
    id: "err-5",
    timestamp: new Date(2025, 3, 25, 9, 27, 8),
    message: "Authentication token expired",
    source: "AuthService.ts:175",
    severity: "info",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/95.0.4638.69",
    userId: "user-567",
    details: `{
      "tokenType": "access",
      "issuedAt": "2025-03-24T09:27:08.000Z",
      "expiresAt": "2025-03-25T09:27:08.000Z",
      "action": "redirect_to_login"
    }`
  },
  {
    id: "err-6",
    timestamp: new Date(2025, 3, 24, 11, 54, 36),
    message: "HubSpot API rate limit exceeded",
    source: "HubspotIntegration.js:93",
    severity: "error",
    userAgent: "Server",
    userId: "system",
    details: `{
      "rateLimit": {
        "limit": 100,
        "current": 101,
        "reset": "2025-03-24T12:00:00.000Z"
      },
      "endpoint": "/contacts/v1/lists/all/contacts/all",
      "retryAfter": 360
    }`
  },
  {
    id: "err-7",
    timestamp: new Date(2025, 3, 24, 8, 3, 12),
    message: "Failed to generate PDF template",
    source: "PDFGenerator.ts:217",
    severity: "error",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/96.0.4664.110",
    userId: "user-890",
    details: `{
      "template": "mediation_agreement.html",
      "variables": {
        "caseId": "case-456",
        "clientName": "John Smith",
        "mediatorName": "Emma Wilson"
      },
      "error": "Template rendering failed at line 32: Cannot read property 'address' of undefined"
    }`
  }
];

export default function AuditLogPage() {
  const isMobile = useIsMobile();
  
  // Audit Log state
  const [logs, setLogs] = useState(auditLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Error Log state
  const [errorLogsList, setErrorLogsList] = useState(errorLogs);
  const [errorSearchQuery, setErrorSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [errorDateRange, setErrorDateRange] = useState({
    from: undefined,
    to: undefined
  });
  const [isErrorRefreshing, setIsErrorRefreshing] = useState(false);
  const [selectedErrorLog, setSelectedErrorLog] = useState(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("audit");
  
  // Helper for icon size - matching Contacts.tsx
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";
  
  // Get unique users for filter
  const uniqueUsers = [...new Set(logs.map(log => log.user.id))].map(userId => {
    const user = logs.find(log => log.user.id === userId)?.user;
    return user ? { id: user.id, name: user.name || user.email } : null;
  }).filter(Boolean);

  // Get unique action types for filter
  const uniqueActions = [...new Set(logs.map(log => {
    // Extract category from action string (e.g., "user" from "user.login")
    const category = log.action.split('.')[0];
    return category;
  }))];
  
  // Filter logs based on search, action type, user and date range
  const filteredLogs = logs.filter(log => {
    // Search in action, user email/name, resource type/id
    const searchIn = [
      log.action,
      log.user.email,
      log.user.name,
      log.resource.type,
      log.resource.id,
    ].filter(Boolean).join(' ').toLowerCase();
    
    const matchesSearch = searchQuery === "" || searchIn.includes(searchQuery.toLowerCase());
    
    // Match action category (e.g., "user" from "user.login")
    const actionCategory = log.action.split('.')[0];
    const matchesAction = actionFilter === "all" || actionCategory === actionFilter;
    
    // Match user
    const matchesUser = userFilter === "all" || log.user.id === userFilter;
    
    // Match date range
    const matchesDateRange = (!dateRange.from || new Date(log.timestamp) >= dateRange.from) && 
                            (!dateRange.to || new Date(log.timestamp) <= dateRange.to);
    
    return matchesSearch && matchesAction && matchesUser && matchesDateRange;
  });

  // Filter error logs based on search, severity and date range
  const filteredErrorLogs = errorLogsList.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(errorSearchQuery.toLowerCase()) || 
                          log.source.toLowerCase().includes(errorSearchQuery.toLowerCase()) ||
                          log.userId.toLowerCase().includes(errorSearchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    
    const matchesDateRange = (!errorDateRange.from || new Date(log.timestamp) >= errorDateRange.from) && 
                            (!errorDateRange.to || new Date(log.timestamp) <= errorDateRange.to);
    
    return matchesSearch && matchesSeverity && matchesDateRange;
  });
  
  // Simulate refreshing logs
  const handleRefresh = () => {
    if (activeTab === "audit") {
      setIsRefreshing(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } else {
      setIsErrorRefreshing(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsErrorRefreshing(false);
      }, 1000);
    }
  };
  
  // Handle viewing log details
  const handleViewLog = (log, isErrorLog = false) => {
    if (isErrorLog) {
      setSelectedErrorLog(log);
      setIsErrorDialogOpen(true);
    } else {
      setSelectedLog(log);
      setIsDialogOpen(true);
    }
  };
  
  // Handle downloading logs
  const handleDownload = () => {
    if (activeTab === "audit") {
      // Create CSV content for audit logs
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers
      csvContent += "Timestamp,Action,User,Resource Type,Resource ID,Details\n";
      
      // Add data rows
      filteredLogs.forEach(log => {
        const row = [
          format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
          log.action,
          log.user.email || log.user.name,
          log.resource.type,
          log.resource.id || "-",
          JSON.stringify(log.changes || log.details || {}).replace(/,/g, ";") // Replace commas in JSON to not break CSV format
        ];
        csvContent += row.join(",") + "\n";
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Download error logs as JSON
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredErrorLogs, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `error-logs-${format(new Date(), 'yyyy-MM-dd')}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };
  
  // Function to copy content to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };
  
  // Get appropriate icon for action type
  const getActionIcon = (action) => {
    const actionType = action.split('.')[0];
    const actionVerb = action.split('.')[1];
    const size = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";
    
    switch(actionType) {
      case "user":
        if (actionVerb === "login" || actionVerb === "logout") return <UserCircle className={size} />;
        if (actionVerb === "invite") return <UserPlus className={size} />;
        return <UserCircle className={size} />;
        
      case "case":
        return <FileEdit className={size} />;
        
      case "document":
        if (actionVerb === "delete") return <Trash className={size} />;
        return <FileEdit className={size} />;
        
      case "settings":
        return <Settings className={size} />;
        
      case "subscription":
      case "payment":
        return <CreditCard className={size} />;
        
      case "system":
        return <Database className={size} />;
        
      default:
        return <Info className={size} />;
    }
  };
  
  // Get appropriate badge for action
  const getActionBadge = (action) => {
    const actionType = action.split('.')[0];
    const actionVerb = action.split('.')[1];
    
    // Security-related actions
    if ((actionType === "user" && (actionVerb === "login" || actionVerb === "logout" || actionVerb === "password_reset")) ||
        actionType === "permission") {
      return <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>{action}</Badge>;
    }
    
    // Creation actions
    if (actionVerb === "create" || actionVerb === "invite" || actionVerb === "add") {
      return <Badge className={`bg-green-100 text-green-800 hover:bg-green-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>{action}</Badge>;
    }
    
    // Deletion actions
    if (actionVerb === "delete" || actionVerb === "remove") {
      return <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>{action}</Badge>;
    }
    
    // Update actions
    if (actionVerb === "update" || actionVerb === "edit" || actionVerb === "modify") {
      return <Badge className={`bg-amber-100 text-amber-800 hover:bg-amber-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>{action}</Badge>;
    }
    
    // System actions
    if (actionType === "system") {
      return <Badge className={`bg-purple-100 text-purple-800 hover:bg-purple-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>{action}</Badge>;
    }
    
    // Default
    return <Badge variant="outline" className={isMobile ? "text-[0.65rem] px-1" : ""}>{action}</Badge>;
  };

  // Get appropriate icon for severity
  const getSeverityIcon = (severity) => {
    switch(severity) {
      case "error":
        return <AlertCircle className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-red-500`} />;
      case "warning":
        return <AlertTriangle className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-amber-500`} />;
      case "info":
        return <Info className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} text-blue-500`} />;
      default:
        return <Info className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />;
    }
  };
  
  // Get appropriate badge for severity
  const getSeverityBadge = (severity) => {
    switch(severity) {
      case "error":
        return <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>Error</Badge>;
      case "warning":
        return <Badge className={`bg-amber-100 text-amber-800 hover:bg-amber-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>Warning</Badge>;
      case "info":
        return <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>Info</Badge>;
      default:
        return <Badge variant="outline" className={isMobile ? "text-[0.65rem] px-1" : ""}>{severity}</Badge>;
    }
  };

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>System Logs</h1>
          <p className="text-muted-foreground text-sm">
            Track system activities, user actions, and errors
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing || isErrorRefreshing}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className={isMobile ? "h-8 text-xs px-2.5" : ""}
          >
            {isRefreshing || isErrorRefreshing ? (
              <>
                <span className="animate-spin mr-1.5">◌</span>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className={`mr-1.5 ${iconSizeClass}`} />
                <span>Refresh</span>
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleDownload}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? "h-8 text-xs px-2.5" : ""}
          >
            <Download className={`mr-1.5 ${iconSizeClass}`} />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ClipboardList className={iconSizeClass} />
            <span>Audit Log</span>
          </TabsTrigger>
          <TabsTrigger value="error" className="flex items-center gap-2">
            <AlertTriangle className={iconSizeClass} />
            <span>Error Log</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit" className="mt-0">
          <Card className={`${isMobile ? "h-[calc(100vh-220px)]" : "h-[calc(100vh-270px)]"} flex flex-col overflow-hidden`}>
            <CardHeader className={`${isMobile ? "px-3 py-3 gap-2" : ""}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle className={isMobile ? "text-base" : ""}>Activity Log</CardTitle>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className={`absolute left-2.5 top-${isMobile ? "2" : "2.5"} ${iconSizeClass} text-muted-foreground`} />
                    <Input
                      placeholder="Search audit logs..."
                      className={`${isMobile ? "pl-7 h-8 text-sm" : "pl-8"} w-full sm:w-[200px] md:w-[300px]`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {!isMobile && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Filter className="h-4 w-4" />
                          <span className="sr-only">Filter</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-4" align="end">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="action-filter">Action Type</Label>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                              <SelectTrigger id="action-filter">
                                <SelectValue placeholder="Action Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {uniqueActions.map(action => (
                                  <SelectItem key={action} value={action}>{action}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="user-filter">User</Label>
                            <Select value={userFilter} onValueChange={setUserFilter}>
                              <SelectTrigger id="user-filter">
                                <SelectValue placeholder="Select User" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {uniqueUsers.map(user => (
                                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Date Range</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {dateRange.from ? (
                                    dateRange.to ? (
                                      <>
                                        {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                                      </>
                                    ) : (
                                      format(dateRange.from, "LLL dd, y")
                                    )
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="range"
                                  selected={dateRange}
                                  onSelect={setDateRange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>

              {isMobile && (
                <div className="flex flex-wrap gap-2">
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {uniqueActions.map(action => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-8 text-xs flex-1">
                        <CalendarIcon className="mr-1.5 h-3 w-3" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "MM/dd")} - {format(dateRange.to, "MM/dd")}
                            </>
                          ) : (
                            format(dateRange.from, "MM/dd/yy")
                          )
                        ) : (
                          <span>Date Range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardHeader>
            <CardContent className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "p-0 px-3" : ""}`}>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-6">
                  <p className={isMobile ? "text-sm" : ""}>No audit logs match your search criteria</p>
                </div>
              ) : (
                isMobile ? (
                  // Mobile view - Card based layout
                  <div className="space-y-2 py-2">
                    {filteredLogs.map((log) => (
                      <Card key={log.id} 
                        className="border"
                        onClick={() => handleViewLog(log)}
                      >
                        <div className="px-3 py-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center">
                              <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-1.5">
                                {getActionIcon(log.action)}
                              </span>
                              {getActionBadge(log.action)}
                            </div>
                            <div className="text-[0.65rem] text-muted-foreground">
                              {format(new Date(log.timestamp), "MM/dd HH:mm")}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[0.7rem]">
                            <div className="font-medium truncate max-w-[150px]">{log.user.name || log.user.email || "System"}</div>
                            <div className="text-muted-foreground capitalize">{log.resource.type}</div>
                          </div>
                          
                          {log.changes && (
                            <div className="mt-1 text-[0.65rem] text-muted-foreground line-clamp-1">
                              {Object.keys(log.changes).map((key, i) => (
                                <span key={key}>
                                  {i > 0 && ", "}{key}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Desktop view - Table layout
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          <TableHead className="w-[200px]">Action</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Resource</TableHead>
                          <TableHead>Changes</TableHead>
                          <TableHead className="w-[80px]">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  {getActionIcon(log.action)}
                                </span>
                                {getActionBadge(log.action)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{log.user.name}</div>
                              {log.user.email && (
                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium capitalize">{log.resource.type}</div>
                              {log.resource.id && (
                                <div className="text-xs font-mono">{log.resource.id}</div>
                              )}
                              {log.resource.name && (
                                <div className="text-xs text-muted-foreground line-clamp-1">{log.resource.name}</div>
                              )}
                              {log.resource.email && (
                                <div className="text-xs text-muted-foreground">{log.resource.email}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              {log.changes ? (
                                <div className="text-sm">
                                  {Object.keys(log.changes).map((key) => (
                                    <div key={key} className="line-clamp-1">
                                      <span className="font-medium">{key}:</span>{" "}
                                      {typeof log.changes[key] === "object" && log.changes[key].from !== undefined ? (
                                        <span>
                                          {JSON.stringify(log.changes[key].from)} →{" "}
                                          {JSON.stringify(log.changes[key].to)}
                                        </span>
                                      ) : (
                                        <span>{JSON.stringify(log.changes[key])}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No changes</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewLog(log)}
                              >
                                <span className="sr-only">View details</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
              
              <div className={`flex justify-between items-center ${isMobile ? "mt-3 px-0.5 text-[0.65rem]" : "mt-4 text-sm"} text-muted-foreground`}>
                <div>
                  Showing {filteredLogs.length} of {logs.length} logs
                </div>
                <div>
                  Last refreshed: {format(new Date(), isMobile ? "HH:mm:ss" : "MMM d, yyyy HH:mm:ss")}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="error" className="mt-0">
          <Card className={`${isMobile ? "h-[calc(100vh-220px)]" : "h-[calc(100vh-270px)]"} flex flex-col overflow-hidden`}>
            <CardHeader className={`${isMobile ? "px-3 py-3 gap-2" : ""}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className={isMobile ? "text-base" : ""}>System Errors</CardTitle>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className={`absolute left-2.5 top-${isMobile ? "2" : "2.5"} ${iconSizeClass} text-muted-foreground`} />
                    <Input
                      placeholder="Search errors..."
                      className={`${isMobile ? "pl-7 h-8 text-sm" : "pl-8"} w-full sm:w-[200px] md:w-[300px]`}
                      value={errorSearchQuery}
                      onChange={(e) => setErrorSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className={isMobile ? "h-8 text-xs" : ""}>
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className={`${isMobile ? "h-8 text-xs" : ""} w-full sm:w-auto justify-start text-left font-normal`}
                        >
                          <CalendarIcon className={`mr-2 ${iconSizeClass}`} />
                          {errorDateRange.from ? (
                            errorDateRange.to ? (
                              <>
                                {format(errorDateRange.from, isMobile ? "MM/dd" : "LLL dd")} - 
                                {format(errorDateRange.to, isMobile ? "MM/dd" : "LLL dd")}
                              </>
                            ) : (
                              format(errorDateRange.from, isMobile ? "MM/dd/yy" : "LLL dd, y")
                            )
                          ) : (
                            <span>Date Range</span>
                          )}
                          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="range"
                          selected={errorDateRange}
                          onSelect={setErrorDateRange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "p-0 px-3" : ""}`}>
              {filteredErrorLogs.length === 0 ? (
                <div className="text-center py-6">
                  <p className={isMobile ? "text-sm" : ""}>No error logs match your search criteria</p>
                </div>
              ) : (
                isMobile ? (
                  // Mobile view - Card based layout
                  <div className="space-y-2 py-2">
                    {filteredErrorLogs.map((log) => (
                      <Card 
                        key={log.id} 
                        className="border"
                        onClick={() => handleViewLog(log, true)}
                      >
                        <div className="px-3 py-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center">
                              <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-1.5">
                                {getSeverityIcon(log.severity)}
                              </span>
                              {getSeverityBadge(log.severity)}
                            </div>
                            <div className="text-[0.65rem] text-muted-foreground">
                              {format(new Date(log.timestamp), "MM/dd HH:mm")}
                            </div>
                          </div>
                          
                          <div className="text-[0.7rem] mb-1">
                            <div className="line-clamp-1">{log.message}</div>
                          </div>
                          
                          <div className="flex items-center justify-between text-[0.65rem]">
                            <div className="font-mono text-muted-foreground">{log.source}</div>
                            <div className="font-medium">{log.userId}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Desktop view - Table layout
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          <TableHead>Error Message</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredErrorLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getSeverityIcon(log.severity)}
                                <span className="ml-2 line-clamp-1">{log.message}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.source}
                            </TableCell>
                            <TableCell>
                              {getSeverityBadge(log.severity)}
                            </TableCell>
                            <TableCell>
                              {log.userId}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewLog(log, true)}
                              >
                                <span className="sr-only">View details</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
              
              <div className={`flex justify-between items-center ${isMobile ? "mt-3 px-0.5 text-[0.65rem]" : "mt-4 text-sm"} text-muted-foreground`}>
                <div>
                  Showing {filteredErrorLogs.length} of {errorLogsList.length} logs
                </div>
                <div>
                  Last refreshed: {format(new Date(), isMobile ? "HH:mm:ss" : "MMM d, yyyy HH:mm:ss")}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Audit log details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`${isMobile ? "max-w-[92%]" : "sm:max-w-[700px]"} overflow-y-auto max-h-[90vh]`}>
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected activity
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
              <div className={`grid grid-cols-2 ${isMobile ? "gap-2" : "gap-4"}`}>
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Timestamp</Label>
                  <div className={`font-medium mt-1 ${isMobile ? "text-xs" : ""}`}>
                    {format(new Date(selectedLog.timestamp), isMobile ? "MM/dd/yy HH:mm:ss" : "MMMM d, yyyy HH:mm:ss")}
                  </div>
                </div>
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Action</Label>
                  <div className="font-medium mt-1">
                    {getActionBadge(selectedLog.action)}
                  </div>
                </div>
              </div>
              
              <div className={`grid grid-cols-2 ${isMobile ? "gap-2" : "gap-4"}`}>
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>User</Label>
                  <div className="mt-1">
                    <div className={`font-medium ${isMobile ? "text-xs" : ""}`}>{selectedLog.user.name || "System"}</div>
                    {selectedLog.user.email && (
                      <div className={isMobile ? "text-[0.65rem] text-muted-foreground" : "text-sm text-muted-foreground"}>
                        {selectedLog.user.email}
                      </div>
                    )}
                    {selectedLog.user.id && (
                      <div className={isMobile ? "text-[0.65rem] font-mono" : "text-xs font-mono"}>
                        {selectedLog.user.id}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Resource</Label>
                  <div className="mt-1">
                    <div className={`font-medium capitalize ${isMobile ? "text-xs" : ""}`}>
                      {selectedLog.resource.type}
                    </div>
                    {selectedLog.resource.id && (
                      <div className={isMobile ? "text-[0.65rem] font-mono" : "text-sm font-mono"}>
                        {selectedLog.resource.id}
                      </div>
                    )}
                    {selectedLog.resource.name && (
                      <div className={isMobile ? "text-[0.65rem]" : "text-sm"}>
                        {selectedLog.resource.name}
                      </div>
                    )}
                    {selectedLog.resource.email && (
                      <div className={isMobile ? "text-[0.65rem]" : "text-sm"}>
                        {selectedLog.resource.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Request Details</Label>
                  <div className={`mt-1 bg-muted p-3 rounded-md ${isMobile ? "text-[0.65rem] space-y-1.5" : "text-sm space-y-2"}`}>
                    {Object.entries(selectedLog.details).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span>{" "}
                        <span className="break-all">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Changes</Label>
                  <div className={`mt-1 bg-muted p-3 rounded-md ${isMobile ? "text-[0.65rem] space-y-2" : "text-sm space-y-3"}`}>
                    {Object.entries(selectedLog.changes).map(([key, value]) => (
                      <div key={key}>
                        <div className="font-medium mb-1">{key}:</div>
                        {typeof value === "object" && value.from !== undefined ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center">
                              <div className={`${isMobile ? "w-10" : "w-16"} text-muted-foreground`}>From:</div>
                              <div className="break-all">{JSON.stringify(value.from) || "(empty)"}</div>
                            </div>
                            <div className="flex items-center">
                              <div className={`${isMobile ? "w-10" : "w-16"} text-muted-foreground`}>To:</div>
                              <div className="break-all">{JSON.stringify(value.to) || "(empty)"}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="break-all">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogClose asChild>
            <Button 
              type="button" 
              className={`mt-2 ${isMobile ? "h-8 text-xs" : ""}`}
            >
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Error log details dialog */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className={`${isMobile ? "max-w-[92%]" : "sm:max-w-[700px]"} overflow-y-auto max-h-[90vh]`}>
          <DialogHeader>
            <DialogTitle>Error Log Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected error
            </DialogDescription>
          </DialogHeader>
          
          {selectedErrorLog && (
            <div className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
              <div className={`grid grid-cols-2 ${isMobile ? "gap-2" : "gap-4"}`}>
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Timestamp</Label>
                  <div className={`font-medium mt-1 ${isMobile ? "text-xs" : ""}`}>
                    {format(new Date(selectedErrorLog.timestamp), isMobile ? "MM/dd/yy HH:mm:ss" : "MMMM d, yyyy HH:mm:ss")}
                  </div>
                </div>
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Severity</Label>
                  <div className="font-medium mt-1">
                    {getSeverityBadge(selectedErrorLog.severity)}
                  </div>
                </div>
              </div>
              
              <div className={`grid grid-cols-2 ${isMobile ? "gap-2" : "gap-4"}`}>
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>User</Label>
                  <div className="mt-1">
                    <div className={`font-medium ${isMobile ? "text-xs" : ""}`}>{selectedErrorLog.userId || "System"}</div>
                    {selectedErrorLog.userId && (
                      <div className={isMobile ? "text-[0.65rem] text-muted-foreground" : "text-sm text-muted-foreground"}>
                        {selectedErrorLog.userId}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Source</Label>
                  <div className="mt-1">
                    <div className={`font-medium ${isMobile ? "text-xs" : ""}`}>
                      {selectedErrorLog.source}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Message</Label>
                <div className={`mt-1 ${isMobile ? "text-xs" : ""}`}>
                  {selectedErrorLog.message}
                </div>
              </div>

              {selectedErrorLog.details && (
                <div>
                  <Label className={`text-muted-foreground ${isMobile ? "text-xs" : ""}`}>Details</Label>
                  <div className={`mt-1 bg-muted p-3 rounded-md ${isMobile ? "text-[0.65rem] space-y-1.5" : "text-sm space-y-2"}`}>
                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(JSON.parse(selectedErrorLog.details), null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogClose asChild>
            <Button 
              type="button" 
              className={`mt-2 ${isMobile ? "h-8 text-xs" : ""}`}
            >
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}