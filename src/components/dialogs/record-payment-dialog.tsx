import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
}

interface RecordPaymentDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (paymentData: any) => void;
  showTrigger?: boolean;
  unpaidInvoices?: Invoice[];
}

export function RecordPaymentDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  showTrigger = true, 
  unpaidInvoices = [] 
}: RecordPaymentDialogProps) {
  const isMobile = useIsMobile();
  const [localOpen, setLocalOpen] = useState(false);
  const dialogOpen = isOpen !== undefined ? isOpen : localOpen;
  
  const [newPayment, setNewPayment] = useState({
    invoiceId: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: "Credit Card",
    notes: ""
  });

  const handleOpenChange = (open: boolean) => {
    if (isOpen !== undefined && onClose && !open) {
      onClose();
    } else {
      setLocalOpen(open);
    }
  };

  const handleRecordPayment = () => {
    const id = `PMT-${Date.now().toString().substring(9)}`;
    const payment = {
      id,
      ...newPayment
    };

    if (onSave) {
      onSave(payment);
    } else {
      toast.success("Payment recorded successfully");
    }

    // Reset form state
    setNewPayment({
      invoiceId: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: "Credit Card",
      notes: ""
    });
    
    handleOpenChange(false);
  };

  // Format currency for display in the dropdown
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px] mx-auto w-[calc(100%-2rem)]">
      <DialogHeader>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogDescription>
          Record a new payment for an invoice
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="invoice">Invoice</Label>
          <Select
            value={newPayment.invoiceId}
            onValueChange={(value) => {
              const invoice = unpaidInvoices.find(inv => inv.id === value);
              setNewPayment({
                ...newPayment,
                invoiceId: value,
                amount: invoice ? invoice.amount : 0
              });
            }}
          >
            <SelectTrigger id="invoice" className={isMobile ? "h-8 text-xs" : ""}>
              <SelectValue placeholder="Select invoice" />
            </SelectTrigger>
            <SelectContent>
              {unpaidInvoices.map((invoice) => (
                <SelectItem key={invoice.id} value={invoice.id}>
                  {invoice.id} - {invoice.clientName} ({formatCurrency(invoice.amount)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="payment-amount">Payment Amount ($)</Label>
          <Input
            id="payment-amount"
            type="number"
            step="0.01"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
            className={isMobile ? "h-8 text-xs" : ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="payment-date">Payment Date</Label>
          <Input
            id="payment-date"
            type="date"
            value={newPayment.date}
            onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
            className={isMobile ? "h-8 text-xs" : ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select
            value={newPayment.method}
            onValueChange={(value) => setNewPayment({...newPayment, method: value})}
          >
            <SelectTrigger id="payment-method" className={isMobile ? "h-8 text-xs" : ""}>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Check">Check</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="payment-notes">Notes</Label>
          <Textarea
            id="payment-notes"
            placeholder="Additional payment details..."
            value={newPayment.notes}
            onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
            className={isMobile ? "text-xs" : ""}
          />
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
          onClick={handleRecordPayment}
          size={isMobile ? "sm" : "default"}
          className={isMobile ? "text-xs" : ""}
          disabled={!newPayment.invoiceId || newPayment.amount <= 0}
        >
          Record Payment
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return showTrigger ? (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size={isMobile ? "sm" : "default"} className="flex items-center gap-2">
          <Plus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          Record Payment
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