import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Calendar as CalendarIcon,
  Download, 
  RefreshCw, 
  Copy,
  ChevronDown,
} from "lucide-react";

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

export default function ErrorLogPage() {
  const isMobile = useIsMobile();
  const [logs, setLogs] = useState(errorLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Filter logs based on search, severity and date range
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.userId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    
    const matchesDateRange = (!dateRange.from || new Date(log.timestamp) >= dateRange.from) && 
                            (!dateRange.to || new Date(log.timestamp) <= dateRange.to);
    
    return matchesSearch && matchesSeverity && matchesDateRange;
  });
  
  // Simulate refreshing logs
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      // In a real app, you would fetch fresh logs here
    }, 1000);
  };
  
  // Handle viewing log details
  const handleViewLog = (log) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };
  
  // Handle downloading logs as JSON
  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `error-logs-${format(new Date(), 'yyyy-MM-dd')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  // Function to copy content to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Get appropriate icon for severity
  const getSeverityIcon = (severity) => {
    switch(severity) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  // Get appropriate badge for severity
  const getSeverityBadge = (severity) => {
    switch(severity) {
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Warning</Badge>;
      case "info":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Error Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and analyze system errors and warnings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size={isMobile ? "sm" : "default"}
          >
            {isRefreshing ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Logs
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleDownload}
            size={isMobile ? "sm" : "default"}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Logs
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>System Errors</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search errors..."
                  className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-full sm:w-[130px]">
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
                    <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
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
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No error logs match your search criteria</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[300px]">Error Message</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
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
                          onClick={() => handleViewLog(log)}
                        >
                          <span className="sr-only">View details</span>
                          <Search className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <div>
              Showing {filteredLogs.length} of {logs.length} logs
            </div>
            <div>
              Last refreshed: {format(new Date(), "MMM d, yyyy HH:mm:ss")}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Error log details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
            <DialogDescription>
              Full information about the selected error
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <div className="font-medium mt-1">
                    {format(new Date(selectedLog.timestamp), "MMMM d, yyyy HH:mm:ss")}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Severity</Label>
                  <div className="font-medium mt-1">
                    {getSeverityBadge(selectedLog.severity)}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Error Message</Label>
                <div className="font-medium mt-1">
                  {selectedLog.message}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Source</Label>
                  <div className="font-mono text-sm mt-1">
                    {selectedLog.source}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">User ID</Label>
                  <div className="font-medium mt-1">
                    {selectedLog.userId}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">User Agent</Label>
                <div className="text-sm mt-1 break-all">
                  {selectedLog.userAgent}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Details</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => copyToClipboard(selectedLog.details)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto mt-1 max-h-[200px]">
                  {selectedLog.details}
                </pre>
              </div>
            </div>
          )}
          
          <DialogClose asChild>
            <Button type="button" className="mt-2">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}