import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Invoice {
  id: string;
  clientName: string;
  matter: string;
  amount: number;
  status: "Draft" | "Unpaid" | "Paid";
  date: string;
}

// Mock data for clients and matters - should be passed as props or fetched inside component
const clients = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Sarah Johnson" },
  { id: 3, name: "Robert Brown" }
];

const matters = [
  { id: 1, title: "Smith vs. Johnson" },
  { id: 2, title: "Property Dispute Resolution" },
  { id: 3, title: "Brown Employment Dispute" }
];

interface EditInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  invoice: Invoice | null;
}

export function EditInvoiceDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  invoice 
}: EditInvoiceDialogProps) {
  const isMobile = useIsMobile();
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  
  // Update the state when the invoice prop changes
  useEffect(() => {
    if (invoice) {
      setEditInvoice({ ...invoice });
    }
  }, [invoice]);
  
  // If no invoice is provided, don't render the dialog
  if (!editInvoice) return null;

  const handleUpdateInvoice = () => {
    if (onSave) {
      onSave(editInvoice);
    } else {
      toast.success("Invoice updated successfully");
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] mx-auto w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Update invoice details
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-id">Invoice ID</Label>
            <Input
              id="edit-id"
              value={editInvoice.id}
              disabled
              className={isMobile ? "h-8 text-xs" : ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-client">Client</Label>
            <Select
              value={editInvoice.clientName}
              onValueChange={(value) => setEditInvoice({...editInvoice, clientName: value})}
            >
              <SelectTrigger id="edit-client" className={isMobile ? "h-8 text-xs" : ""}>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-matter">Matter</Label>
          <Select
            value={editInvoice.matter}
            onValueChange={(value) => setEditInvoice({...editInvoice, matter: value})}
          >
            <SelectTrigger id="edit-matter" className={isMobile ? "h-8 text-xs" : ""}>
              <SelectValue placeholder="Select matter" />
            </SelectTrigger>
            <SelectContent>
              {matters.map((matter) => (
                <SelectItem key={matter.id} value={matter.title}>{matter.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-amount">Amount ($)</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={editInvoice.amount}
              onChange={(e) => setEditInvoice({...editInvoice, amount: parseFloat(e.target.value)})}
              className={isMobile ? "h-8 text-xs" : ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={editInvoice.date}
              onChange={(e) => setEditInvoice({...editInvoice, date: e.target.value})}
              className={isMobile ? "h-8 text-xs" : ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={editInvoice.status}
              onValueChange={(value: "Draft" | "Unpaid" | "Paid") => setEditInvoice({...editInvoice, status: value})}
            >
              <SelectTrigger id="edit-status" className={isMobile ? "h-8 text-xs" : ""}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? "text-xs" : ""}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateInvoice}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? "text-xs" : ""}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}