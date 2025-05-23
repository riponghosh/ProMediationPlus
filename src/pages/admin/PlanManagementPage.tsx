import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Plus, 
  Edit, 
  Trash, 
  Check, 
  X, 
  CreditCard,
  Users,
  HardDrive,
  FileText,
  Calendar,
  Mail,
  ShieldCheck,
  PenTool,
  Save
} from "lucide-react";

// Mock subscription plans data
const subscriptionPlans = [
  {
    id: "plan-basic",
    name: "Basic",
    description: "Essential tools for solo mediators",
    price: 19.99,
    billingCycle: "monthly",
    status: "active",
    features: [
      { name: "5 active cases", included: true },
      { name: "Basic document templates", included: true },
      { name: "1 user", included: true },
      { name: "5GB storage", included: true },
      { name: "Email support", included: true },
      { name: "Basic reporting", included: true },
      { name: "Client portal", included: false },
      { name: "Custom branding", included: false },
      { name: "API access", included: false },
      { name: "Advanced analytics", included: false }
    ],
    created: "2024-08-15",
    lastUpdated: "2025-02-10"
  },
  {
    id: "plan-professional",
    name: "Professional",
    description: "Full-featured solution for growing practices",
    price: 49.99,
    billingCycle: "monthly",
    status: "active",
    features: [
      { name: "25 active cases", included: true },
      { name: "All document templates", included: true },
      { name: "3 users", included: true },
      { name: "25GB storage", included: true },
      { name: "Priority email support", included: true },
      { name: "Advanced reporting", included: true },
      { name: "Client portal", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: false },
      { name: "Advanced analytics", included: false }
    ],
    created: "2024-08-15",
    lastUpdated: "2025-03-05"
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    description: "Complete solution for established mediation firms",
    price: 99.99,
    billingCycle: "monthly",
    status: "active",
    features: [
      { name: "Unlimited active cases", included: true },
      { name: "All document templates", included: true },
      { name: "10 users", included: true },
      { name: "100GB storage", included: true },
      { name: "24/7 priority support", included: true },
      { name: "Advanced reporting", included: true },
      { name: "Client portal", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
      { name: "Advanced analytics", included: true }
    ],
    created: "2024-08-15",
    lastUpdated: "2025-02-28"
  },
  {
    id: "plan-annual-basic",
    name: "Basic (Annual)",
    description: "Essential tools for solo mediators with annual billing",
    price: 199.99,
    billingCycle: "annual",
    status: "active",
    features: [
      { name: "5 active cases", included: true },
      { name: "Basic document templates", included: true },
      { name: "1 user", included: true },
      { name: "5GB storage", included: true },
      { name: "Email support", included: true },
      { name: "Basic reporting", included: true },
      { name: "Client portal", included: false },
      { name: "Custom branding", included: false },
      { name: "API access", included: false },
      { name: "Advanced analytics", included: false }
    ],
    created: "2024-10-05",
    lastUpdated: "2025-01-15"
  },
  {
    id: "plan-annual-professional",
    name: "Professional (Annual)",
    description: "Full-featured solution for growing practices with annual billing",
    price: 499.99,
    billingCycle: "annual",
    status: "active",
    features: [
      { name: "25 active cases", included: true },
      { name: "All document templates", included: true },
      { name: "3 users", included: true },
      { name: "25GB storage", included: true },
      { name: "Priority email support", included: true },
      { name: "Advanced reporting", included: true },
      { name: "Client portal", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: false },
      { name: "Advanced analytics", included: false }
    ],
    created: "2024-10-05",
    lastUpdated: "2025-01-15"
  },
  {
    id: "plan-annual-enterprise",
    name: "Enterprise (Annual)",
    description: "Complete solution for established mediation firms with annual billing",
    price: 999.99,
    billingCycle: "annual",
    status: "active",
    features: [
      { name: "Unlimited active cases", included: true },
      { name: "All document templates", included: true },
      { name: "10 users", included: true },
      { name: "100GB storage", included: true },
      { name: "24/7 priority support", included: true },
      { name: "Advanced reporting", included: true },
      { name: "Client portal", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
      { name: "Advanced analytics", included: true }
    ],
    created: "2024-10-05",
    lastUpdated: "2025-01-15"
  },
  {
    id: "plan-legacy",
    name: "Legacy Plan",
    description: "No longer available for new customers",
    price: 39.99,
    billingCycle: "monthly",
    status: "archived",
    features: [
      { name: "10 active cases", included: true },
      { name: "Basic document templates", included: true },
      { name: "2 users", included: true },
      { name: "10GB storage", included: true },
      { name: "Email support", included: true },
      { name: "Basic reporting", included: true },
      { name: "Client portal", included: false },
      { name: "Custom branding", included: false },
      { name: "API access", included: false },
      { name: "Advanced analytics", included: false }
    ],
    created: "2023-05-01",
    lastUpdated: "2024-07-30"
  }
];

// Standard features for feature selection/creation
const standardFeatures = [
  { id: "cases", name: "Active Cases", icon: FileText, options: ["5", "10", "25", "50", "Unlimited"] },
  { id: "users", name: "Users", icon: Users, options: ["1", "2", "3", "5", "10", "Unlimited"] },
  { id: "storage", name: "Storage", icon: HardDrive, options: ["5GB", "10GB", "25GB", "50GB", "100GB", "Unlimited"] },
  { id: "templates", name: "Document Templates", icon: PenTool, options: ["Basic", "Standard", "All"] },
  { id: "support", name: "Support", icon: Mail, options: ["Email", "Priority Email", "24/7 Priority"] },
  { id: "reporting", name: "Reporting", icon: Calendar, options: ["Basic", "Advanced"] },
  { id: "portal", name: "Client Portal", icon: Users, options: ["Yes", "No"] },
  { id: "branding", name: "Custom Branding", icon: PenTool, options: ["Yes", "No"] },
  { id: "api", name: "API Access", icon: ShieldCheck, options: ["Yes", "No"] },
  { id: "analytics", name: "Advanced Analytics", icon: Calendar, options: ["Yes", "No"] }
];

export default function PlanManagementPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [plans, setPlans] = useState(subscriptionPlans);
  const [editingPlan, setEditingPlan] = useState(null);
  const [filterCycle, setFilterCycle] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "monthly",
    status: "active",
    features: standardFeatures.map(feature => ({
      name: feature.name,
      included: false
    }))
  });
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filter plans based on cycle and status
  const filteredPlans = plans.filter(plan => {
    const matchesCycle = filterCycle === "all" || plan.billingCycle === filterCycle;
    const matchesStatus = filterStatus === "all" || plan.status === filterStatus;
    return matchesCycle && matchesStatus;
  });
  
  // Update plan status
  const handleStatusChange = (planId, newStatus) => {
    setPlans(plans.map(plan => 
      plan.id === planId ? { ...plan, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : plan
    ));
    
    // Show toast notification
    toast({
      title: `Plan status updated`,
      description: `The plan status has been changed to ${newStatus}.`,
    });
  };
  
  // Start editing a plan
  const handleEditPlan = (plan) => {
    setEditingPlan({...plan});
  };
  
  // Save edited plan
  const handleSavePlan = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id ? { 
          ...editingPlan, 
          lastUpdated: new Date().toISOString().split('T')[0]
        } : plan
      ));
      
      setIsSaving(false);
      setEditingPlan(null);
      
      toast({
        title: "Plan updated",
        description: "The subscription plan has been updated successfully.",
      });
    }, 1000);
  };
  
  // Create new plan
  const handleCreatePlan = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const id = `plan-${newPlan.name.toLowerCase().replace(/\s+/g, '-')}`;
      
      const createdPlan = {
        ...newPlan,
        id,
        price: parseFloat(newPlan.price),
        created: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      setPlans([createdPlan, ...plans]);
      setIsSaving(false);
      setIsCreatingPlan(false);
      
      // Reset form
      setNewPlan({
        name: "",
        description: "",
        price: "",
        billingCycle: "monthly",
        status: "active",
        features: standardFeatures.map(feature => ({
          name: feature.name,
          included: false
        }))
      });
      
      toast({
        title: "Plan created",
        description: "The new subscription plan has been created successfully.",
      });
    }, 1000);
  };
  
  // Delete a plan
  const handleDeletePlan = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setPlans(plans.filter(plan => plan.id !== deletingPlan.id));
      setIsSaving(false);
      setDeletingPlan(null);
      
      toast({
        title: "Plan deleted",
        description: "The subscription plan has been deleted successfully.",
      });
    }, 1000);
  };

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl md:text-3xl"} font-bold`}>Plan Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage subscription plans for your service
          </p>
        </div>
        <Dialog open={isCreatingPlan} onOpenChange={setIsCreatingPlan}>
          <DialogTrigger asChild>
            <Button className={`mt-4 sm:mt-0 ${isMobile ? "h-8 text-xs" : ""}`}>
              <Plus className={isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"} />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className={`${isMobile ? "max-w-[92%]" : "sm:max-w-[600px]"}`}>
            <DialogHeader>
              <DialogTitle className={isMobile ? "text-base" : ""}>Create Subscription Plan</DialogTitle>
              <DialogDescription className={isMobile ? "text-xs" : ""}>
                Define the details for your new subscription plan
              </DialogDescription>
            </DialogHeader>
            
            <div className={`grid gap-${isMobile ? "3" : "4"} py-${isMobile ? "3" : "4"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="plan-name" className={isMobile ? "text-sm" : ""}>Plan Name</Label>
                  <Input 
                    id="plan-name" 
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    placeholder="e.g., Professional"
                    className={isMobile ? "h-8 text-sm" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-price" className={isMobile ? "text-sm" : ""}>Price</Label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isMobile ? "text-sm" : ""}`}>$</span>
                    <Input 
                      id="plan-price" 
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                      type="number"
                      step="0.01"
                      min="0"
                      className={`pl-7 ${isMobile ? "h-8 text-sm" : ""}`}
                      placeholder="49.99"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan-description" className={isMobile ? "text-sm" : ""}>Description</Label>
                <Textarea 
                  id="plan-description" 
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  placeholder="Briefly describe this plan"
                  rows={2}
                  className={isMobile ? "text-sm" : ""}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="billing-cycle" className={isMobile ? "text-sm" : ""}>Billing Cycle</Label>
                  <Select 
                    value={newPlan.billingCycle}
                    onValueChange={(value) => setNewPlan({...newPlan, billingCycle: value})}
                  >
                    <SelectTrigger id="billing-cycle" className={isMobile ? "h-8 text-sm" : ""}>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-status" className={isMobile ? "text-sm" : ""}>Status</Label>
                  <Select 
                    value={newPlan.status}
                    onValueChange={(value) => setNewPlan({...newPlan, status: value})}
                  >
                    <SelectTrigger id="plan-status" className={isMobile ? "h-8 text-sm" : ""}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className={isMobile ? "text-sm" : ""}>Included Features</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {newPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`feature-${index}`}
                        checked={feature.included}
                        onCheckedChange={(checked) => {
                          const updatedFeatures = [...newPlan.features];
                          updatedFeatures[index].included = checked === true;
                          setNewPlan({...newPlan, features: updatedFeatures});
                        }}
                        className={isMobile ? "h-3.5 w-3.5" : ""}
                      />
                      <Label 
                        htmlFor={`feature-${index}`}
                        className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}
                      >
                        {feature.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreatingPlan(false)}
                className={isMobile ? "h-8 text-xs" : ""}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePlan}
                disabled={!newPlan.name || !newPlan.price || isSaving}
                className={isMobile ? "h-8 text-xs" : ""}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Creating...
                  </>
                ) : (
                  <>Create Plan</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className={isMobile ? "px-3 py-3" : ""}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className={isMobile ? "text-base" : ""}>Subscription Plans</CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Select value={filterCycle} onValueChange={setFilterCycle}>
                <SelectTrigger className={`w-full sm:w-[150px] ${isMobile ? "h-8 text-sm" : ""}`}>
                  <SelectValue placeholder="Billing Cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className={`w-full sm:w-[150px] ${isMobile ? "h-8 text-sm" : ""}`}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "px-3 py-3" : ""}>
          {isMobile ? (
            // Mobile card view
            <div className="space-y-2">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">{plan.name}</div>
                        <div className="text-xs text-muted-foreground">{plan.description}</div>
                      </div>
                      <Badge 
                        className={`
                          ${plan.status === "active" ? "bg-green-100 text-green-800" : 
                            plan.status === "draft" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"} 
                          ${isMobile ? "text-[0.65rem] h-5" : ""}
                        `}
                      >
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">${plan.price.toFixed(2)}</div>
                      <Badge variant="outline" className={`capitalize ${isMobile ? "text-[0.65rem] h-5" : ""}`}>
                        {plan.billingCycle}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      Last updated: {plan.lastUpdated}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 h-7 text-xs"
                        onClick={() => setDeletingPlan(plan)}
                      >
                        <Trash className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredPlans.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No subscription plans match the current filters
                </div>
              )}
            </div>
          ) : (
            // Desktop table view
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">{plan.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        ${plan.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {plan.billingCycle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            plan.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                            plan.status === "draft" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                            "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {plan.lastUpdated}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeletingPlan(plan)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredPlans.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No subscription plans match the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Plan Dialog */}
      {editingPlan && (
        <Dialog open={editingPlan !== null} onOpenChange={(open) => !open && setEditingPlan(null)}>
          <DialogContent className={`${isMobile ? "max-w-[92%]" : "sm:max-w-[600px]"}`}>
            <DialogHeader>
              <DialogTitle className={isMobile ? "text-base" : ""}>Edit Subscription Plan</DialogTitle>
              <DialogDescription className={isMobile ? "text-xs" : ""}>
                Make changes to the subscription plan
              </DialogDescription>
            </DialogHeader>
            
            <div className={`grid gap-${isMobile ? "3" : "4"} py-${isMobile ? "3" : "4"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-plan-name" className={isMobile ? "text-sm" : ""}>Plan Name</Label>
                  <Input 
                    id="edit-plan-name" 
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                    className={isMobile ? "h-8 text-sm" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plan-price" className={isMobile ? "text-sm" : ""}>Price</Label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isMobile ? "text-sm" : ""}`}>$</span>
                    <Input 
                      id="edit-plan-price" 
                      value={editingPlan.price}
                      onChange={(e) => setEditingPlan({
                        ...editingPlan, 
                        price: e.target.value === "" ? "" : parseFloat(e.target.value)
                      })}
                      type="number"
                      step="0.01"
                      min="0"
                      className={`pl-7 ${isMobile ? "h-8 text-sm" : ""}`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-plan-description" className={isMobile ? "text-sm" : ""}>Description</Label>
                <Textarea 
                  id="edit-plan-description" 
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                  rows={2}
                  className={isMobile ? "text-sm" : ""}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-billing-cycle" className={isMobile ? "text-sm" : ""}>Billing Cycle</Label>
                  <Select 
                    value={editingPlan.billingCycle}
                    onValueChange={(value) => setEditingPlan({...editingPlan, billingCycle: value})}
                  >
                    <SelectTrigger id="edit-billing-cycle" className={isMobile ? "h-8 text-sm" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plan-status" className={isMobile ? "text-sm" : ""}>Status</Label>
                  <Select 
                    value={editingPlan.status}
                    onValueChange={(value) => setEditingPlan({...editingPlan, status: value})}
                  >
                    <SelectTrigger id="edit-plan-status" className={isMobile ? "h-8 text-sm" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className={isMobile ? "text-sm" : ""}>Included Features</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {editingPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-feature-${index}`}
                        checked={feature.included}
                        onCheckedChange={(checked) => {
                          const updatedFeatures = [...editingPlan.features];
                          updatedFeatures[index].included = checked === true;
                          setEditingPlan({...editingPlan, features: updatedFeatures});
                        }}
                        className={isMobile ? "h-3.5 w-3.5" : ""}
                      />
                      <Label 
                        htmlFor={`edit-feature-${index}`}
                        className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}
                      >
                        {feature.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditingPlan(null)}
                className={isMobile ? "h-8 text-xs" : ""}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSavePlan}
                disabled={!editingPlan.name || !editingPlan.price || isSaving}
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingPlan !== null} onOpenChange={(open) => !open && setDeletingPlan(null)}>
        <DialogContent className={`${isMobile ? "max-w-[92%]" : ""}`}>
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-base" : ""}>Delete Subscription Plan</DialogTitle>
            <DialogDescription className={isMobile ? "text-xs" : ""}>
              Are you sure you want to delete this plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deletingPlan && (
            <div className={`py-${isMobile ? "3" : "4"} border-y`}>
              <div className={`font-semibold ${isMobile ? "text-sm" : ""}`}>{deletingPlan.name}</div>
              <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>{deletingPlan.description}</div>
              <div className="mt-2">
                <Badge 
                  className={`
                    ${deletingPlan.status === "active" ? "bg-green-100 text-green-800" : 
                      deletingPlan.status === "draft" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"}
                    ${isMobile ? "text-[0.65rem] h-5" : ""}
                  `}
                >
                  {deletingPlan.status.charAt(0).toUpperCase() + deletingPlan.status.slice(1)}
                </Badge>
                <span className={`${isMobile ? "text-xs" : "text-sm"} ml-2`}>
                  ${deletingPlan.price.toFixed(2)} / {deletingPlan.billingCycle}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter className={`mt-${isMobile ? "3" : "4"} gap-2`}>
            <Button 
              variant="outline" 
              onClick={() => setDeletingPlan(null)}
              className={isMobile ? "h-8 text-xs" : ""}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePlan}
              disabled={isSaving}
              className={isMobile ? "h-8 text-xs" : ""}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Deleting...
                </>
              ) : (
                <>Delete Plan</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Features Reference */}
      <Card>
        <CardHeader className={isMobile ? "px-3 py-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>Plan Features Reference</CardTitle>
          <CardDescription className={isMobile ? "text-xs" : ""}>
            Common features used in subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-3 py-3" : ""}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {standardFeatures.map((feature) => (
              <div key={feature.id} className="flex items-start space-x-2">
                <div className={`${isMobile ? "h-7 w-7" : "h-8 w-8"} rounded-lg bg-muted flex items-center justify-center`}>
                  <feature.icon className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </div>
                <div>
                  <h4 className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>{feature.name}</h4>
                  <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-0.5`}>
                    Options: {feature.options.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}