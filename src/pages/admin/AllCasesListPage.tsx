import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { FolderOpen, Search, Filter, MoreHorizontal, UserPlus } from "lucide-react";

// Mock data for cases
const cases = [
  {
    id: "MED-2023-001",
    clientName: "Johnson Family",
    mediator: "Emma Wilson",
    status: "active",
    createdDate: "2023-03-15",
    lastActivity: "2023-04-25",
    type: "Divorce Mediation"
  },
  {
    id: "MED-2023-002",
    clientName: "Smith & Brown LLC",
    mediator: "Michael Roberts",
    status: "completed",
    createdDate: "2023-02-08",
    lastActivity: "2023-04-10",
    type: "Business Dispute"
  },
  {
    id: "MED-2023-003",
    clientName: "Williams vs. Garcia",
    mediator: "David Anderson",
    status: "active",
    createdDate: "2023-04-01",
    lastActivity: "2023-04-23",
    type: "Workplace Mediation"
  },
  {
    id: "MED-2023-004",
    clientName: "Thompson Estate",
    mediator: "Emma Wilson",
    status: "on-hold",
    createdDate: "2023-03-22",
    lastActivity: "2023-04-15",
    type: "Estate Dispute"
  },
  {
    id: "MED-2023-005",
    clientName: "Miller & Rodriguez",
    mediator: "Sarah Johnson",
    status: "active",
    createdDate: "2023-04-12",
    lastActivity: "2023-04-24",
    type: "Co-Parenting"
  },
];

// Status badge variations
const getStatusBadge = (status: string) => {
  switch(status.toLowerCase()) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case "completed":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
    case "on-hold":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">On Hold</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AllCasesListPage() {
  const isMobile = useIsMobile();
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  const handleReassign = (caseItem: any) => {
    setSelectedCase(caseItem);
    setIsReassignOpen(true);
  };

  return (
    // Apply mobile spacing
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      {/* Apply mobile header layout/sizing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl md:text-3xl"} font-bold`}>All Cases</h1>
          <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground mt-1`}>View and manage all case files in the system</p>
        </div>
        {/* No "Create" button in the original, so no change needed here */}
      </div>

      <Card className="shadow-sm">
        {/* Apply mobile card header padding/sizing */}
        <CardHeader className={isMobile ? "px-3 py-3" : ""}>
          {/* Filter section - Adjust layout for mobile */}
          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row justify-between items-start sm:items-center gap-4'}`}>
            <CardTitle className={isMobile ? "text-base" : ""}>Case Files</CardTitle>

            <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row items-start sm:items-center gap-4'} w-full sm:w-auto`}>
              <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
                <Search className={`absolute left-2.5 top-2.5 ${iconSizeClass} text-muted-foreground`} /> {/* Apply mobile icon size */}
                <Input
                  placeholder="Search cases..."
                  className={`pl-8 ${isMobile ? "h-8 text-xs" : ""} w-full sm:w-[250px]`} // Mobile input size
                />
              </div>

              <div className={`flex gap-2 ${isMobile ? 'w-full' : 'w-auto'}`}>
                <Select>
                  <SelectTrigger className={`w-full sm:w-[130px] ${isMobile ? 'h-8 text-xs' : ''}`}> {/* Mobile select size */}
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className={`w-full sm:w-[160px] ${isMobile ? 'h-8 text-xs' : ''}`}> {/* Mobile select size */}
                    <SelectValue placeholder="All Mediators" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mediators</SelectItem>
                    <SelectItem value="emma-wilson">Emma Wilson</SelectItem>
                    <SelectItem value="michael-roberts">Michael Roberts</SelectItem>
                    <SelectItem value="david-anderson">David Anderson</SelectItem>
                    <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size={isMobile ? "sm" : "icon"} className={isMobile ? "h-8 w-8" : ""}> {/* Mobile button size */}
                  <Filter className={iconSizeClass} /> {/* Apply mobile icon size */}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        {/* Apply mobile card content padding (or remove for list view) */}
        <CardContent className={isMobile ? "px-0 py-0" : ""}>
          {/* Conditional rendering: Card list for mobile, Table for desktop */}
          {isMobile ? (
            <div className="px-3 pb-3 space-y-2 mt-2">
              {cases.map((caseItem) => (
                <Card key={caseItem.id} className="border overflow-hidden">
                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">{caseItem.id}</span>
                      {getStatusBadge(caseItem.status)}
                    </div>
                    <div className="text-xs font-medium mb-1">{caseItem.clientName}</div>
                    <div className="text-[0.65rem] text-muted-foreground mb-1.5">{caseItem.type}</div>
                    <div className="text-[0.65rem] text-muted-foreground mb-1.5">Mediator: {caseItem.mediator}</div>
                    <div className="text-[0.65rem] text-muted-foreground">Created: {caseItem.createdDate}</div>

                    <div className="flex justify-end gap-1 mt-2">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"> {/* Smaller button for mobile actions */}
                              <MoreHorizontal className={iconSizeClass} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className={isMobile ? "text-xs" : ""}> {/* Adjust dropdown item text size */}
                              <FolderOpen className={`${iconSizeClass} mr-2`} /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className={isMobile ? "text-xs" : ""} onClick={() => handleReassign(caseItem)}> {/* Adjust dropdown item text size */}
                              <UserPlus className={`${iconSizeClass} mr-2`} /> Reassign Mediator
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className={isMobile ? "text-xs" : ""}>Export Case Data</DropdownMenuItem> {/* Adjust dropdown item text size */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table View (Original)
            <div className="rounded-md border overflow-x-auto"> {/* Added overflow for small screens */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mediator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.id}</TableCell>
                      <TableCell>{caseItem.clientName}</TableCell>
                      <TableCell>{caseItem.type}</TableCell>
                      <TableCell>{caseItem.mediator}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{caseItem.createdDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className={iconSizeClass} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <FolderOpen className={`${iconSizeClass} mr-2`} /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReassign(caseItem)}>
                              <UserPlus className={`${iconSizeClass} mr-2`} /> Reassign Mediator
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Export Case Data</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={isReassignOpen} onOpenChange={setIsReassignOpen}>
        {/* Adjusted max-width and padding for mobile */}
        <DialogContent className={`${isMobile ? "max-w-[95vw] p-4" : "sm:max-w-[425px]"}`}>
          <DialogHeader className={isMobile ? "pb-3" : ""}>
            <DialogTitle className={isMobile ? "text-base" : ""}>Reassign Case</DialogTitle>
            <DialogDescription className={isMobile ? "text-xs" : ""}>
              Reassign {selectedCase?.id}: {selectedCase?.clientName} to another mediator
            </DialogDescription>
          </DialogHeader>
          <div className={`space-y-4 ${isMobile ? "py-2" : "py-4"}`}> {/* Reduced spacing for mobile */}
            <div className="space-y-1.5"> {/* Reduced spacing */}
              <Label htmlFor="current-mediator" className={isMobile ? "text-xs" : ""}>Current Mediator</Label>
              <Input id="current-mediator" value={selectedCase?.mediator} disabled className={isMobile ? "h-9 text-xs" : ""} /> {/* Mobile input size */}
            </div>
            <div className="space-y-1.5"> {/* Reduced spacing */}
              <Label htmlFor="new-mediator" className={isMobile ? "text-xs" : ""}>New Mediator</Label>
              <Select>
                <SelectTrigger id="new-mediator" className={isMobile ? "h-9 text-xs" : ""}> {/* Mobile select size */}
                  <SelectValue placeholder="Select mediator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emma-wilson">Emma Wilson</SelectItem>
                  <SelectItem value="michael-roberts">Michael Roberts</SelectItem>
                  <SelectItem value="david-anderson">David Anderson</SelectItem>
                  <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"> {/* Reduced spacing */}
              <Label htmlFor="reassign-reason" className={isMobile ? "text-xs" : ""}>Reason for Reassignment</Label>
              <Input id="reassign-reason" placeholder="Briefly explain the reason for reassignment" className={isMobile ? "h-9 text-xs" : ""} /> {/* Mobile input size */}
            </div>
            <div className="space-y-2">
              <Label className={isMobile ? "text-xs" : ""}>Notification Options</Label>
              <div className={`flex items-center space-x-2 ${isMobile ? "text-xs" : "text-sm"}`}>
                <input type="checkbox" id="notify-mediator" className="rounded" defaultChecked />
                <Label htmlFor="notify-mediator">Notify current mediator</Label>
              </div>
              <div className={`flex items-center space-x-2 ${isMobile ? "text-xs" : "text-sm"}`}>
                <input type="checkbox" id="notify-client" className="rounded" />
                <Label htmlFor="notify-client">Notify client</Label>
              </div>
            </div>
          </div>
          {/* Dialog Footer - Adjust button size/layout for mobile */}
          <DialogFooter className={`gap-2 ${isMobile ? 'flex-col-reverse sm:flex-row' : ''}`}>
            <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setIsReassignOpen(false)}>Cancel</Button>
            <Button type="submit" size={isMobile ? "sm" : "default"}>Reassign Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}