import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Settings, 
  Save, 
  Lock, 
  Globe, 
  Mail, 
  FileText, 
  BellRing, 
  Shield,
  Layers,
  Upload,
  Palette,
  ToggleLeft,
  AlertTriangle,
  Search,
  Plus,
} from "lucide-react";

// Mock feature flags data for demonstration
const featureFlags = [
  {
    id: "new-dashboard-ui",
    name: "New Dashboard UI",
    description: "Enable the redesigned dashboard interface",
    status: true,
    environment: "all",
    type: "ui",
    lastUpdated: "2 days ago",
    updatedBy: "Sarah Johnson"
  },
  {
    id: "client-portal-access",
    name: "Client Portal Access",
    description: "Allow clients to access their dedicated portal",
    status: true,
    environment: "production",
    type: "feature",
    lastUpdated: "1 week ago",
    updatedBy: "David Anderson"
  },
  {
    id: "advanced-billing",
    name: "Advanced Billing Features",
    description: "Enable advanced billing and subscription management",
    status: false,
    environment: "development",
    type: "feature", 
    lastUpdated: "3 days ago",
    updatedBy: "Emma Wilson"
  },
  {
    id: "document-ai",
    name: "Document AI Analysis",
    description: "AI-powered document analysis and summarization",
    status: false,
    environment: "staging",
    type: "feature",
    lastUpdated: "5 days ago",
    updatedBy: "Michael Roberts"
  },
  {
    id: "timeline-visualization",
    name: "Case Timeline Visualization",
    description: "Interactive timeline visualization for case events",
    status: true,
    environment: "all",
    type: "ui",
    lastUpdated: "1 day ago",
    updatedBy: "Lisa Thompson"
  }
];

export default function SettingsPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Feature flags state
  const [flags, setFlags] = useState(featureFlags);
  const [searchQuery, setSearchQuery] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [newFlag, setNewFlag] = useState({
    name: "",
    description: "",
    environment: "all",
    type: "feature"
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-5 w-5";

  // Handle toggle for feature flags
  const handleToggleStatus = (id: string) => {
    setFlags(flags.map(flag => 
      flag.id === id ? { ...flag, status: !flag.status } : flag
    ));
    
    // Show toast notification
    const flag = flags.find(f => f.id === id);
    if (flag) {
      toast({
        title: `${flag.name} ${!flag.status ? "enabled" : "disabled"}`,
        description: `The feature flag has been ${!flag.status ? "turned on" : "turned off"}.`,
      });
    }
  };
  
  // Filter flags based on search and filters
  const filteredFlags = flags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         flag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnvironment = environmentFilter === "all" || flag.environment === environmentFilter || 
                              (environmentFilter === "all" && flag.environment === "all");
    const matchesType = typeFilter === "all" || flag.type === typeFilter;
    
    return matchesSearch && matchesEnvironment && matchesType;
  });
  
  // Handle saving all flag changes
  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Changes saved",
        description: "Your feature flag changes have been saved successfully.",
      });
    }, 1000);
  };
  
  // Handle creating a new feature flag
  const handleCreateFlag = () => {
    // Generate a simple ID from the name
    const id = newFlag.name.toLowerCase().replace(/\s+/g, '-');
    
    // Create new flag
    const createdFlag = {
      id,
      ...newFlag,
      status: false,
      lastUpdated: "Just now",
      updatedBy: "Current User"
    };
    
    // Add to flags list
    setFlags([createdFlag, ...flags]);
    
    // Reset form and close dialog
    setNewFlag({
      name: "",
      description: "",
      environment: "all",
      type: "feature"
    });
    setDialogOpen(false);
    
    // Show success message
    toast({
      title: "Feature flag created",
      description: `${newFlag.name} has been created successfully.`,
    });
  };

  // Get appropriate badge for environment
  const getEnvironmentBadge = (environment: string) => {
    switch(environment) {
      case "production":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Production</Badge>;
      case "staging":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Staging</Badge>;
      case "development":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Development</Badge>;
      case "all":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">All Environments</Badge>;
      default:
        return <Badge variant="outline">{environment}</Badge>;
    }
  };

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl md:text-3xl"} font-bold tracking-tight`}>Admin Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
        <TabsList className={`
          grid ${isMobile ? "grid-cols-2 grid-rows-3" : "grid-cols-2 md:grid-cols-6"}
          w-full
          h-auto p-1
          bg-muted rounded-lg
          gap-1
          ${!isMobile ? 'md:w-auto md:inline-grid' : ''}
        `}>
          <TabsTrigger 
            value="general"
            className={`
              flex items-center justify-center gap-1.5
              ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
              rounded-md
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
            `}
          >
            <Settings className={iconSizeClass} />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className={`
              flex items-center justify-center gap-1.5
              ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
              rounded-md
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
            `}
          >
            <Shield className={iconSizeClass} />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            className={`
              flex items-center justify-center gap-1.5
              ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
              rounded-md
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
            `}
          >
            <BellRing className={iconSizeClass} />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="backup"
            className={`
              flex items-center justify-center gap-1.5
              ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
              rounded-md
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
            `}
          >
            <Layers className={iconSizeClass} />
            Backup
          </TabsTrigger>
          <TabsTrigger 
            value="features"
            className={`
              flex items-center justify-center gap-1.5
              ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
              rounded-md
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
            `}
          >
            <ToggleLeft className={iconSizeClass} />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger 
            value="branding"
            className={`
              flex items-center justify-center gap-1.5
              ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
              rounded-md
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
            `}
          >
            <Palette className={iconSizeClass} />
            Branding
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
                <Globe className={iconSizeClass} />
                System Settings
              </CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>Configure the basic system settings</CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-6`}>
              <div className="space-y-2">
                <Label htmlFor="app-name" className={isMobile ? "text-sm" : ""}>Application Name</Label>
                <Input id="app-name" defaultValue="MediatorPro" className={isMobile ? "h-8 text-sm" : ""} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone" className={isMobile ? "text-sm" : ""}>Default Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger id="timezone" className={isMobile ? "h-8 text-sm" : ""}>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-format" className={isMobile ? "text-sm" : ""}>Date Format</Label>
                <Select defaultValue="MM/DD/YYYY">
                  <SelectTrigger id="date-format" className={isMobile ? "h-8 text-sm" : ""}>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="MMMM D, YYYY">MMMM D, YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode" className={isMobile ? "text-sm" : ""}>Maintenance Mode</Label>
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                      Temporarily disable access for non-admin users
                    </p>
                  </div>
                  <Switch id="maintenance-mode" className={`${isMobile ? "h-4 w-7" : ""} flex-shrink-0`} />
                </div>
              </div>
            </CardContent>
            <CardFooter className={`flex justify-end border-t ${isMobile ? "px-3 py-3" : "px-6 py-4"}`}>
              <Button className={isMobile ? "h-8 text-xs" : ""}>
                <Save className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
                <Shield className={iconSizeClass} />
                Security Settings
              </CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-6`}>
              <div className="space-y-2">
                <Label htmlFor="password-policy" className={isMobile ? "text-sm" : ""}>Password Policy</Label>
                <Select defaultValue="strong">
                  <SelectTrigger id="password-policy" className={isMobile ? "h-8 text-sm" : ""}>
                    <SelectValue placeholder="Select password policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                    <SelectItem value="standard">Standard (8+ chars, 1 uppercase, 1 number)</SelectItem>
                    <SelectItem value="strong">Strong (8+ chars, uppercase, number, special)</SelectItem>
                    <SelectItem value="custom">Custom Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-timeout" className={isMobile ? "text-sm" : ""}>Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="30" className={isMobile ? "h-8 text-sm" : ""} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor" className={isMobile ? "text-sm" : ""}>Require Two-Factor Authentication</Label>
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                      Enforce 2FA for all administrative users
                    </p>
                  </div>
                  <Switch id="two-factor" defaultChecked className={isMobile ? "h-4 w-7" : ""} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audit-logs" className={isMobile ? "text-sm" : ""}>Enable Audit Logging</Label>
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                      Track all administrative actions for security review
                    </p>
                  </div>
                  <Switch id="audit-logs" defaultChecked className={isMobile ? "h-4 w-7" : ""} />
                </div>
              </div>
            </CardContent>
            <CardFooter className={`flex justify-end border-t ${isMobile ? "px-3 py-3" : "px-6 py-4"}`}>
              <Button className={isMobile ? "h-8 text-xs" : ""}>
                <Save className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
                <BellRing className={iconSizeClass} />
                System Notifications
              </CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>Configure system-wide notification settings</CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-6`}>
              <div className="space-y-4">
                <h3 className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Email Notifications</h3>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-user-creation" className={`flex-1 ${isMobile ? "text-xs" : ""}`}>
                      User Registration
                    </Label>
                    <Switch id="notify-user-creation" defaultChecked className={`${isMobile ? "h-4 w-7" : ""} flex-shrink-0`} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-maintenance" className={`flex-1 ${isMobile ? "text-xs" : ""}`}>
                      System Maintenance
                    </Label>
                    <Switch id="notify-maintenance" defaultChecked className={`${isMobile ? "h-4 w-7" : ""} flex-shrink-0`} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-security" className={`flex-1 ${isMobile ? "text-xs" : ""}`}>
                      Security Alerts
                    </Label>
                    <Switch id="notify-security" defaultChecked className={`${isMobile ? "h-4 w-7" : ""} flex-shrink-0`} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-backup" className={`flex-1 ${isMobile ? "text-xs" : ""}`}>
                      Backup Completion
                    </Label>
                    <Switch id="notify-backup" className={`${isMobile ? "h-4 w-7" : ""} flex-shrink-0`} />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="notification-recipients" className={isMobile ? "text-sm" : ""}>Default Notification Recipients</Label>
                <Input id="notification-recipients" placeholder="email1@example.com, email2@example.com" className={isMobile ? "h-8 text-sm" : ""} />
                <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-1`}>
                  Comma-separated list of email addresses to receive system notifications
                </p>
              </div>
            </CardContent>
            <CardFooter className={`flex justify-end border-t ${isMobile ? "px-3 py-3" : "px-6 py-4"}`}>
              <Button className={isMobile ? "h-8 text-xs" : ""}>
                <Save className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
                <Layers className={iconSizeClass} />
                Backup & Restore
              </CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>Manage system backup settings and restore points</CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-backup" className={isMobile ? "text-sm" : ""}>Automatic Backups</Label>
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                      Schedule regular system backups
                    </p>
                  </div>
                  <Switch id="auto-backup" defaultChecked className={isMobile ? "h-4 w-7" : ""} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-frequency" className={isMobile ? "text-sm" : ""}>Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency" className={isMobile ? "h-8 text-sm" : ""}>
                    <SelectValue placeholder="Select backup frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-retention" className={isMobile ? "text-sm" : ""}>Backup Retention (days)</Label>
                <Input id="backup-retention" type="number" defaultValue="30" className={isMobile ? "h-8 text-sm" : ""} />
              </div>
              
              <div className={`flex flex-col sm:flex-row gap-2 ${isMobile ? "mt-3" : "mt-4"}`}>
                <Button className={`flex-1 ${isMobile ? "h-8 text-xs" : ""}`}>Create Manual Backup</Button>
                <Button variant="outline" className={`flex-1 ${isMobile ? "h-8 text-xs" : ""}`}>Restore from Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Feature Flags Tab Content */}
        <TabsContent value="features" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold`}>Feature Flags</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and configure feature flags across environments
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <Button 
                onClick={handleSaveChanges} 
                disabled={isSaving}
                variant="outline"
                className={isMobile ? "h-8 text-xs" : ""}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className={isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"} />
                    Save Changes
                  </>
                )}
              </Button>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className={isMobile ? "h-8 text-xs" : ""}>
                    <Plus className={isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"} />
                    New Feature Flag
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${isMobile ? "max-w-[92%]" : "sm:max-w-[425px]"}`}>
                  <DialogHeader>
                    <DialogTitle className={isMobile ? "text-base" : ""}>Create Feature Flag</DialogTitle>
                    <DialogDescription className={isMobile ? "text-xs" : ""}>
                      Define a new feature flag to control feature availability
                    </DialogDescription>
                  </DialogHeader>
                  <div className={`grid gap-${isMobile ? "3" : "4"} py-${isMobile ? "3" : "4"}`}>
                    <div className="space-y-2">
                      <Label htmlFor="flag-name" className={isMobile ? "text-sm" : ""}>Flag Name</Label>
                      <Input 
                        id="flag-name" 
                        value={newFlag.name}
                        onChange={(e) => setNewFlag({...newFlag, name: e.target.value})}
                        placeholder="e.g., New Analytics Dashboard"
                        className={isMobile ? "h-8 text-sm" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flag-description" className={isMobile ? "text-sm" : ""}>Description</Label>
                      <Input 
                        id="flag-description" 
                        value={newFlag.description}
                        onChange={(e) => setNewFlag({...newFlag, description: e.target.value})}
                        placeholder="Briefly describe what this flag controls"
                        className={isMobile ? "h-8 text-sm" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flag-environment" className={isMobile ? "text-sm" : ""}>Environment</Label>
                      <Select 
                        value={newFlag.environment}
                        onValueChange={(value) => setNewFlag({...newFlag, environment: value})}
                      >
                        <SelectTrigger id="flag-environment" className={isMobile ? "h-8 text-sm" : ""}>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Environments</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flag-type" className={isMobile ? "text-sm" : ""}>Flag Type</Label>
                      <Select 
                        value={newFlag.type}
                        onValueChange={(value) => setNewFlag({...newFlag, type: value})}
                      >
                        <SelectTrigger id="flag-type" className={isMobile ? "h-8 text-sm" : ""}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feature">Feature Toggle</SelectItem>
                          <SelectItem value="ui">UI Component</SelectItem>
                          <SelectItem value="permission">Permission</SelectItem>
                          <SelectItem value="experiment">A/B Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      className={isMobile ? "h-8 text-xs" : ""}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateFlag}
                      disabled={!newFlag.name}
                      className={isMobile ? "h-8 text-xs" : ""}
                    >
                      Create Flag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
                  <ToggleLeft className={iconSizeClass} />
                  Feature Flags
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className={`absolute left-2.5 top-${isMobile ? "2" : "2.5"} ${isMobile ? "h-3 w-3" : "h-4 w-4"} text-muted-foreground`} />
                    <Input
                      placeholder="Search flags..."
                      className={`pl-8 w-full sm:w-[200px] md:w-[250px] ${isMobile ? "h-8 text-sm" : ""}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                      <SelectTrigger className={`w-full sm:w-[130px] ${isMobile ? "h-8 text-sm" : ""}`}>
                        <SelectValue placeholder="Environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Environments</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className={`w-full sm:w-[100px] ${isMobile ? "h-8 text-sm" : ""}`}>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="feature">Feature</SelectItem>
                        <SelectItem value="ui">UI</SelectItem>
                        <SelectItem value="permission">Permission</SelectItem>
                        <SelectItem value="experiment">Experiment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className={isMobile ? "px-3 py-3" : ""}>
              {filteredFlags.length === 0 ? (
                <div className="text-center py-6">
                  <p className={`${isMobile ? "text-sm" : ""} text-muted-foreground`}>No feature flags match your search criteria</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  {isMobile ? (
                    // Mobile card view
                    <div className="divide-y">
                      {filteredFlags.map((flag) => (
                        <div key={flag.id} className="p-3 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-sm">{flag.name}</div>
                              <div className="text-xs text-muted-foreground">{flag.description}</div>
                            </div>
                            <div className="flex items-center">
                              <Switch
                                checked={flag.status}
                                onCheckedChange={() => handleToggleStatus(flag.id)}
                                className="h-4 w-7"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            {getEnvironmentBadge(flag.environment)}
                            <span className="capitalize text-muted-foreground">{flag.type}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div>Updated {flag.lastUpdated}</div>
                            <div>by {flag.updatedBy}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Desktop table view
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Name & Description</TableHead>
                          <TableHead>Environment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Updated By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFlags.map((flag) => (
                          <TableRow key={flag.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{flag.name}</div>
                                <div className="text-sm text-muted-foreground">{flag.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getEnvironmentBadge(flag.environment)}
                            </TableCell>
                            <TableCell>
                              <span className="capitalize">{flag.type}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={flag.status}
                                  onCheckedChange={() => handleToggleStatus(flag.id)}
                                />
                                <span className={flag.status ? "text-green-600" : "text-muted-foreground"}>
                                  {flag.status ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{flag.lastUpdated}</TableCell>
                            <TableCell>{flag.updatedBy}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
              
              <Alert className={`mt-4 bg-amber-50 border-amber-200 text-amber-800 ${isMobile ? "py-2" : ""}`}>
                <AlertTriangle className={isMobile ? "h-3 w-3 mt-0.5" : "h-4 w-4 mt-0.5"} />
                <AlertDescription className={isMobile ? "text-xs" : ""}>
                  Changes to feature flags in production may immediately affect user experience.
                  Make sure to test thoroughly before enabling features in production.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="branding" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
                <Palette className={iconSizeClass} />
                Visual Identity
              </CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Customize logos and colors for your application
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo-upload" className={isMobile ? "text-sm" : ""}>Company Logo</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition cursor-pointer">
                    <img 
                      src="/placeholder.svg" 
                      alt="Logo Preview" 
                      className="h-20 object-contain mb-2" 
                    />
                    <Button variant="outline" size={isMobile ? "sm" : "default"} asChild>
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Upload className={`${isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"}`} />
                        Change Logo
                      </label>
                    </Button>
                    <Input 
                      id="logo-upload" 
                      type="file" 
                      accept=".svg,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                  </div>
                  <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                    Recommended size: 200x50px, transparent background
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="favicon-upload" className={isMobile ? "text-sm" : ""}>Favicon</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition cursor-pointer">
                    <Globe className={`${isMobile ? "h-8 w-8" : "h-12 w-12"} text-muted-foreground mb-2`} />
                    <Button variant="outline" size={isMobile ? "sm" : "default"} asChild>
                      <label htmlFor="favicon-upload" className="cursor-pointer">
                        <Upload className={`${isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"}`} />
                        Upload Favicon
                      </label>
                    </Button>
                    <Input 
                      id="favicon-upload" 
                      type="file" 
                      accept=".ico,.png,.svg"
                      className="hidden"
                    />
                  </div>
                  <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                    Square image, min 32x32px
                  </p>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-4">
                <h3 className={`${isMobile ? "text-sm" : ""} font-medium`}>Color Scheme</h3>
                
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color" className={isMobile ? "text-sm" : ""}>Primary Color</Label>
                    <div className="flex">
                      <div 
                        className="w-10 h-10 rounded-l border border-r-0" 
                        style={{ backgroundColor: "#0066cc" }}
                      />
                      <Input 
                        id="primary-color" 
                        type="text" 
                        defaultValue="#0066cc"
                        className={`rounded-l-none ${isMobile ? "h-8 text-sm" : ""}`}
                      />
                    </div>
                    <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                      Used for primary buttons and accents
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color" className={isMobile ? "text-sm" : ""}>Secondary Color</Label>
                    <div className="flex">
                      <div 
                        className="w-10 h-10 rounded-l border border-r-0" 
                        style={{ backgroundColor: "#4caf50" }}
                      />
                      <Input 
                        id="secondary-color" 
                        type="text" 
                        defaultValue="#4caf50"
                        className={`rounded-l-none ${isMobile ? "h-8 text-sm" : ""}`}
                      />
                    </div>
                    <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                      Used for secondary UI elements
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accent-color" className={isMobile ? "text-sm" : ""}>Accent Color</Label>
                    <div className="flex">
                      <div 
                        className="w-10 h-10 rounded-l border border-r-0" 
                        style={{ backgroundColor: "#ff9800" }}
                      />
                      <Input 
                        id="accent-color" 
                        type="text" 
                        defaultValue="#ff9800"
                        className={`rounded-l-none ${isMobile ? "h-8 text-sm" : ""}`}
                      />
                    </div>
                    <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                      Used for highlights and notifications
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
                <FileText className={iconSizeClass} />
                Text & Messaging
              </CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Customize the text and terminology used in your application
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="app-name-branding" className={isMobile ? "text-sm" : ""}>Application Name</Label>
                  <Input id="app-name-branding" defaultValue="MediatorPro" className={isMobile ? "h-8 text-sm" : ""} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instance-name" className={isMobile ? "text-sm" : ""}>Instance Name</Label>
                  <Input id="instance-name" defaultValue="Your Organization" placeholder="Your Organization" className={isMobile ? "h-8 text-sm" : ""} />
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div>
                <h3 className={`${isMobile ? "text-sm" : ""} font-medium mb-3`}>Terminology Customization</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="term-client" className={isMobile ? "text-sm" : ""}>Term for "Client"</Label>
                    <Input id="term-client" defaultValue="Client" className={isMobile ? "h-8 text-sm" : ""} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="term-case" className={isMobile ? "text-sm" : ""}>Term for "Case"</Label>
                    <Input id="term-case" defaultValue="Case" className={isMobile ? "h-8 text-sm" : ""} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="term-session" className={isMobile ? "text-sm" : ""}>Term for "Session"</Label>
                    <Input id="term-session" defaultValue="Session" className={isMobile ? "h-8 text-sm" : ""} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="term-mediator" className={isMobile ? "text-sm" : ""}>Term for "Mediator"</Label>
                    <Input id="term-mediator" defaultValue="Mediator" className={isMobile ? "h-8 text-sm" : ""} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <h3 className={`${isMobile ? "text-sm" : ""} font-medium mb-3`}>Legal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="legal-name" className={isMobile ? "text-sm" : ""}>Legal Company Name</Label>
                  <Input id="legal-name" defaultValue="Your Company Legal Name" className={isMobile ? "h-8 text-sm" : ""} />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="copyright" className={isMobile ? "text-sm" : ""}>Copyright Text</Label>
                    <Input id="copyright" defaultValue="© 2025 Your Company" className={isMobile ? "h-8 text-sm" : ""} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="terms-url" className={isMobile ? "text-sm" : ""}>Terms of Service URL</Label>
                    <Input id="terms-url" defaultValue="https://example.com/terms" className={isMobile ? "h-8 text-sm" : ""} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
                <Mail className={iconSizeClass} />
                Email Branding
              </CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Customize the appearance of emails sent from your application
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
              <div className="space-y-2">
                <Label htmlFor="email-header-image" className={isMobile ? "text-sm" : ""}>Email Header Image</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                  <Upload className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-muted-foreground mb-2`} />
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-center`}>
                    Drop your email header image here, or <label htmlFor="email-header" className="text-primary underline cursor-pointer">browse</label>
                  </p>
                  <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-1`}>
                    PNG or JPG, 600px wide recommended
                  </p>
                  <Input id="email-header" type="file" className="hidden" />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email-from-name" className={isMobile ? "text-sm" : ""}>Email "From" Name</Label>
                  <Input id="email-from-name" defaultValue="MediatorPro" className={isMobile ? "h-8 text-sm" : ""} />
                  <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                    Display name for outgoing emails
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-from-address" className={isMobile ? "text-sm" : ""}>Email "From" Address</Label>
                  <Input id="email-from-address" defaultValue="no-reply@example.com" className={isMobile ? "h-8 text-sm" : ""} />
                  <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                    Must be verified in your email provider
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-footer" className={isMobile ? "text-sm" : ""}>Email Footer Text</Label>
                <Input id="email-footer" defaultValue="© 2025 Your Company. All rights reserved." className={isMobile ? "h-8 text-sm" : ""} />
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <input type="checkbox" id="include-social" defaultChecked />
                <Label htmlFor="include-social" className={isMobile ? "text-sm" : ""}>Include social media links in email footer</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}