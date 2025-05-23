import React, { useState } from "react";
import { AdminPageLayout } from "@/components/layout/admin-page-layout";
import { AdminCard } from "@/components/layout/admin-card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AdminTabsList } from "@/components/layout/admin-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMobileStyling } from "@/lib/mobileStyling";
import { Settings, Shield, BellRing, Plus, Search } from "lucide-react";

export default function ExampleAdminPage() {
  const { isMobile, formStyles, buttonStyles, iconSizes } = useMobileStyling();
  const [activeTab, setActiveTab] = useState("general");
  
  // Example tabs configuration with icons
  const tabs = [
    { value: "general", label: "General", icon: <Settings /> },
    { value: "security", label: "Security", icon: <Shield /> },
    { value: "notifications", label: "Notifications", icon: <BellRing /> },
  ];

  return (
    <AdminPageLayout
      title="Example Admin Page"
      subtitle="Demonstrating consistent mobile styling across admin pages"
      actions={
        <Button className={buttonStyles.standard}>
          <Plus className={iconSizes.button} />
          New Item
        </Button>
      }
    >
      <Tabs 
        defaultValue="general" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className={isMobile ? "space-y-3" : "space-y-4"}
      >
        <AdminTabsList tabs={tabs} />
        
        {/* General Tab Content */}
        <TabsContent value="general" className={isMobile ? "space-y-3" : "space-y-4"}>
          <AdminCard 
            title="General Settings" 
            description="Configure basic system settings"
            icon={<Settings className={iconSizes.standard} />}
            showSaveButton
            onSave={() => console.log("Saving general settings")}
          >
            <div className={formStyles.spacing}>
              <div className="space-y-2">
                <Label htmlFor="app-name" className={formStyles.label}>Application Name</Label>
                <Input id="app-name" defaultValue="MediatorPro" className={formStyles.input} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="app-description" className={formStyles.label}>Description</Label>
                <Input id="app-description" defaultValue="Mediation case management" className={formStyles.input} />
                <p className={`${formStyles.helperText} text-muted-foreground mt-1`}>
                  This appears in the browser tab and app metadata
                </p>
              </div>
            </div>
          </AdminCard>
        </TabsContent>
        
        {/* Security Tab Content */}
        <TabsContent value="security" className={isMobile ? "space-y-3" : "space-y-4"}>
          <AdminCard 
            title="Security Settings" 
            description="Configure security options"
            icon={<Shield className={iconSizes.standard} />}
            showSaveButton
          >
            <div className="text-center py-12">
              <p className="text-muted-foreground">Security settings content would go here</p>
            </div>
          </AdminCard>
        </TabsContent>
        
        {/* Notifications Tab Content */}
        <TabsContent value="notifications" className={isMobile ? "space-y-3" : "space-y-4"}>
          <AdminCard 
            title="Notification Settings" 
            description="Configure notification preferences"
            icon={<BellRing className={iconSizes.standard} />}
            showSaveButton
          >
            <div className="text-center py-12">
              <p className="text-muted-foreground">Notification settings content would go here</p>
            </div>
          </AdminCard>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}