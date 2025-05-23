import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Smartphone, 
  CheckCircle, 
  RefreshCw, 
  Users, 
  MessageSquare, 
  FileText, 
  Calendar, 
  AlertCircle 
} from "lucide-react";

export default function HubspotPage() {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl md:text-3xl"} font-bold`}>HubSpot Integration</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage HubSpot CRM integration and data synchronization</p>
        </div>
        
        <div className="flex items-center mt-4 sm:mt-0">
          <Badge className={`bg-green-100 text-green-800 flex items-center gap-1.5 ${isMobile ? "px-1.5 py-0.5 text-[0.65rem] h-5" : "px-2.5 py-1"}`}>
            <CheckCircle className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
            Connected
          </Badge>
        </div>
      </div>

      <Alert className={isMobile ? "py-2" : ""}>
        <AlertCircle className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
        <AlertTitle className={isMobile ? "text-sm" : ""}>Integration Status</AlertTitle>
        <AlertDescription className={isMobile ? "text-xs" : ""}>
          Your HubSpot account is currently connected and syncing data. Last sync was 35 minutes ago.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className={isMobile ? "px-3 py-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>API Configuration</CardTitle>
          <CardDescription className={isMobile ? "text-xs" : ""}>
            Manage your HubSpot API connection settings
          </CardDescription>
        </CardHeader>
        <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
          <div className="space-y-2">
            <Label htmlFor="api-key" className={isMobile ? "text-sm" : ""}>API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                value="•••••••••••••••••••••••••••••"
                disabled
                className={`font-mono ${isMobile ? "h-8 text-sm" : ""}`}
              />
              <Button variant="outline" className={isMobile ? "h-8 text-xs" : ""}>Show</Button>
              <Button variant="outline" className={isMobile ? "h-8 text-xs" : ""}>Reset</Button>
            </div>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
              Your API key is securely stored and never displayed in full
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="account-id" className={isMobile ? "text-sm" : ""}>HubSpot Account ID</Label>
              <span className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Verified</span>
            </div>
            <Input 
              id="account-id" 
              value="84729103" 
              disabled 
              className={isMobile ? "h-8 text-sm" : ""}
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync" className={isMobile ? "text-sm" : ""}>Automatic Synchronization</Label>
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  Sync data with HubSpot every 30 minutes
                </p>
              </div>
              <Switch id="auto-sync" defaultChecked className={isMobile ? "h-4 w-7" : ""} />
            </div>
          </div>
        </CardContent>
        <CardFooter className={`flex justify-between border-t ${isMobile ? "px-3 py-3" : "px-6 py-4"}`}>
          <Button 
            variant="outline" 
            className={`gap-2 ${isMobile ? "h-8 text-xs" : ""}`}
          >
            <RefreshCw className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
            Sync Now
          </Button>
          <Button className={isMobile ? "h-8 text-xs" : ""}>Save Changes</Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="data-mapping" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
        <TabsList className={isMobile ? "grid w-full grid-cols-3 gap-1 text-xs h-8" : ""}>
          <TabsTrigger value="data-mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="sync-history">Sync History</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-mapping" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Data Field Mapping</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>Configure how data is synchronized between systems</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-3 py-3" : ""}>
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className={`flex items-center justify-between border p-${isMobile ? "2" : "3"} rounded-md`}>
                    <div className="flex items-center gap-2">
                      <Users className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                      <div>
                        <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>Contacts</p>
                        <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>MediatorlPro Contact → HubSpot Contact</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={isMobile ? "text-[0.65rem] h-5" : ""}>12 fields</Badge>
                  </div>
                  
                  <div className={`flex items-center justify-between border p-${isMobile ? "2" : "3"} rounded-md`}>
                    <div className="flex items-center gap-2">
                      <FileText className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                      <div>
                        <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>Case Files</p>
                        <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Mediator Pro Cases → HubSpot Deals</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={isMobile ? "text-[0.65rem] h-5" : ""}>8 fields</Badge>
                  </div>
                  
                  <div className={`flex items-center justify-between border p-${isMobile ? "2" : "3"} rounded-md`}>
                    <div className="flex items-center gap-2">
                      <Calendar className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                      <div>
                        <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>Sessions</p>
                        <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Mediator Pro Sessions → HubSpot Meetings</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={isMobile ? "text-[0.65rem] h-5" : ""}>5 fields</Badge>
                  </div>
                  
                  <div className={`flex items-center justify-between border p-${isMobile ? "2" : "3"} rounded-md`}>
                    <div className="flex items-center gap-2">
                      <MessageSquare className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                      <div>
                        <p className={`font-medium ${isMobile ? "text-sm" : ""}`}>Communications</p>
                        <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Mediator Pro Notes → HubSpot Notes</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={isMobile ? "text-[0.65rem] h-5" : ""}>3 fields</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync-history" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Synchronization History</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>Records of recent data synchronizations</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-3 py-3" : ""}>
              <div className="space-y-4">
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Sync history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Advanced Integration Settings</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>Configure advanced integration options</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-3 py-3" : ""}>
              <div className="space-y-4">
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Advanced settings will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}