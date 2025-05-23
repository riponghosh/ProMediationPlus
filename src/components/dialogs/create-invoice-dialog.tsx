import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface CreateInvoiceDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (invoiceData: any) => void;
  showTrigger?: boolean;
}

export function CreateInvoiceDialog({ isOpen, onClose, onSave, showTrigger = true }: CreateInvoiceDialogProps) {
  const isMobile = useIsMobile();
  const [localOpen, setLocalOpen] = useState(false);
  const dialogOpen = isOpen !== undefined ? isOpen : localOpen;
  
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    matter: "",
    amount: 0,
    status: "Draft" as "Draft" | "Unpaid" | "Paid",
    date: new Date().toISOString().split('T')[0],
  });

  const handleOpenChange = (open: boolean) => {
    if (isOpen !== undefined && onClose && !open) {
      onClose();
    } else {
      setLocalOpen(open);
    }
  };

  const handleCreateInvoice = () => {
    const id = `INV-${Date.now().toString().substring(9)}`;
    const invoice = {
      id,
      ...newInvoice
    };

    if (onSave) {
      onSave(invoice);
    } else {
      toast.success("Invoice created successfully");
    }

    // Reset form state
    setNewInvoice({
      clientName: "",
      matter: "",
      amount: 0,
      status: "Draft",
      date: new Date().toISOString().split('T')[0],
    });
    
    handleOpenChange(false);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px] mx-auto w-[calc(100%-2rem)]">
      <DialogHeader>
        <DialogTitle>Create New Bill</DialogTitle>
        <DialogDescription>
          Create a new invoice for a client
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="client">Client</Label>
          <Select
            value={newInvoice.clientName}
            onValueChange={(value) => setNewInvoice({...newInvoice, clientName: value})}
          >
            <SelectTrigger id="client" className={isMobile ? "h-8 text-xs" : ""}>
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
          <Label htmlFor="matter">Matter</Label>
          <Select
            value={newInvoice.matter}
            onValueChange={(value) => setNewInvoice({...newInvoice, matter: value})}
          >
            <SelectTrigger id="matter" className={isMobile ? "h-8 text-xs" : ""}>
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
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={newInvoice.amount}
            onChange={(e) => setNewInvoice({...newInvoice, amount: parseFloat(e.target.value)})}
            className={isMobile ? "h-8 text-xs" : ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="invoice-date">Date</Label>
          <Input
            id="invoice-date"
            type="date"
            value={newInvoice.date}
            onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
            className={isMobile ? "h-8 text-xs" : ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={newInvoice.status}
            onValueChange={(value: "Draft" | "Unpaid" | "Paid") => setNewInvoice({...newInvoice, status: value})}
          >
            <SelectTrigger id="status" className={isMobile ? "h-8 text-xs" : ""}>
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
          onClick={() => handleOpenChange(false)}
          size={isMobile ? "sm" : "default"}
          className={isMobile ? "text-xs" : ""}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateInvoice}
          size={isMobile ? "sm" : "default"}
          className={isMobile ? "text-xs" : ""}
        >
          Create
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return showTrigger ? (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2">
          <FileText className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          Create Invoice
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  ) : (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}