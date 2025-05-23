import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText, Eye, Edit, Check, BanknoteIcon, CircleDollarSign, Files, Plus
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateInvoiceDialog } from "@/components/dialogs/create-invoice-dialog";
import { RecordPaymentDialog } from "@/components/dialogs/record-payment-dialog";
import { EditInvoiceDialog } from "@/components/dialogs/edit-invoice-dialog";

// Define invoice and payment types
interface Invoice {
  id: string;
  clientName: string;
  matter: string;
  amount: number;
  status: "Draft" | "Unpaid" | "Paid";
  date: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
}

// Mock data for billing
const initialInvoices: Invoice[] = [
  {
    id: "INV-001",
    clientName: "John Smith",
    matter: "Smith vs. Johnson",
    amount: 2500.00,
    status: "Draft",
    date: "2023-06-15",
  },
  {
    id: "INV-002",
    clientName: "Sarah Johnson",
    matter: "Property Dispute Resolution",
    amount: 1800.00,
    status: "Unpaid",
    date: "2023-06-10",
  },
  {
    id: "INV-003",
    clientName: "Robert Brown",
    matter: "Brown Employment Dispute",
    amount: 3200.00,
    status: "Paid",
    date: "2023-05-28",
  }
];

const initialPayments: Payment[] = [
  {
    id: "PMT-001",
    invoiceId: "INV-003",
    amount: 3200.00,
    date: "2023-05-28",
    method: "Credit Card",
    notes: "Payment received in full"
  }
];

const BillingPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();

  // Dialog control states
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle creating a new invoice
  const handleCreateInvoice = (invoiceData: any) => {
    setInvoices([...invoices, invoiceData]);
    toast.success("Invoice created successfully");
  };

  // Handle recording a new payment
  const handleRecordPayment = (paymentData: any) => {
    // Update the related invoice status to "Paid"
    const updatedInvoices = invoices.map(invoice =>
      invoice.id === paymentData.invoiceId ? { ...invoice, status: "Paid" as const } : invoice
    );

    setPayments([...payments, paymentData]);
    setInvoices(updatedInvoices);
    toast.success("Payment recorded successfully");
  };

  // Handle updating an invoice
  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const updatedInvoices = invoices.map(invoice =>
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    );

    setInvoices(updatedInvoices);
    toast.success("Invoice updated successfully");
  };

  // Handle deleting an invoice
  const handleDeleteInvoice = (invoiceToDelete: Invoice) => {
    setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
    toast.success("Invoice deleted successfully");
  };

  // Start editing an invoice
  const startEditInvoice = (invoice: Invoice) => {
    setEditInvoice({...invoice});
    setIsEditingInvoice(true);
  };

  // Filter invoices based on active tab
  const getFilteredInvoices = () => {
    if (activeTab === "all") return invoices;
    return invoices.filter(invoice => invoice.status.toLowerCase() === activeTab);
  };

  // Get unpaid invoices for payment dropdown
  const unpaidInvoices = invoices.filter(invoice => invoice.status === "Unpaid");

  // Calculate totals
  const draftTotal = invoices
    .filter(i => i.status === "Draft")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const unpaidTotal = invoices
    .filter(i => i.status === "Unpaid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidTotal = invoices
    .filter(i => i.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getTabTitle = () => {
    switch(activeTab) {
      case "draft": return "Draft Invoices";
      case "unpaid": return "Unpaid Invoices";
      case "paid": return "Paid Invoices";
      default: return "All Invoices";
    }
  };

  // Helper for icon size - matching Settings.tsx
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <Layout>
      <div className={`flex flex-col h-full ${isMobile ? "space-y-4" : "space-y-6"} overflow-hidden`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Billing</h1>
            <p className="text-muted-foreground text-sm">
              Manage invoices, track payments, and set billing targets
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"} 
              className="flex items-center gap-2"
              onClick={() => setIsCreatingBill(true)}
            >
              <FileText className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              Create Invoice
            </Button>

            <Button 
              size={isMobile ? "sm" : "default"} 
              className="flex items-center gap-2"
              onClick={() => setIsRecordingPayment(true)}
            >
              <Plus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              Record Payment
            </Button>

            {/* Modal components */}
            <CreateInvoiceDialog 
              isOpen={isCreatingBill} 
              onClose={() => setIsCreatingBill(false)} 
              onSave={handleCreateInvoice} 
              showTrigger={false} 
            />
            
            <RecordPaymentDialog 
              isOpen={isRecordingPayment} 
              onClose={() => setIsRecordingPayment(false)} 
              onSave={handleRecordPayment} 
              showTrigger={false} 
              unpaidInvoices={unpaidInvoices} 
            />
            
            <EditInvoiceDialog 
              isOpen={isEditingInvoice} 
              onClose={() => setIsEditingInvoice(false)} 
              onSave={handleUpdateInvoice} 
              onDelete={handleDeleteInvoice}
              invoice={editInvoice} 
            />
          </div>
        </div>

        {/* Combined Summary Card */}
        <Card>
          <CardHeader className={`pb-2 ${isMobile ? "p-3" : ""}`}>
            <CardTitle className="text-sm font-medium">Billing Summary</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "p-3 pt-0" : ""}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`${isMobile ? "text-lg" : "text-xl"} font-bold`}>{formatCurrency(draftTotal)}</div>
                <div className="text-xs text-muted-foreground">Draft Bills</div>
              </div>
              <div>
                <div className={`${isMobile ? "text-lg" : "text-xl"} font-bold`}>{formatCurrency(unpaidTotal)}</div>
                <div className="text-xs text-muted-foreground">Unpaid Invoices</div>
              </div>
              <div>
                <div className={`${isMobile ? "text-lg" : "text-xl"} font-bold`}>{formatCurrency(paidTotal)}</div>
                <div className="text-xs text-muted-foreground">Paid Invoices</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-[calc(100vh-300px)] flex flex-col overflow-hidden">
          <CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"}`}>
            <div className="flex justify-between items-center">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`
                  grid ${isMobile ? "grid-cols-4" : "grid-cols-4"}
                  w-full
                  h-auto p-1
                  bg-muted rounded-lg
                  gap-1
                  ${!isMobile ? 'md:w-auto md:inline-grid' : ''}
                `}>
                  <TabsTrigger 
                    value="all" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <Files className={iconSizeClass} />
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="draft" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <FileText className={iconSizeClass} />
                    Draft
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unpaid" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <BanknoteIcon className={iconSizeClass} />
                    Unpaid
                  </TabsTrigger>
                  <TabsTrigger 
                    value="paid" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <CircleDollarSign className={iconSizeClass} />
                    Paid
                  </TabsTrigger>
                </TabsList>

                <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-0"} sm:flex-row sm:justify-between sm:items-center ${isMobile ? "mt-2 mb-1" : "mt-4 mb-2"}`}>
                  <CardTitle className={isMobile ? "text-base" : ""}>{getTabTitle()}</CardTitle>
                  <Input
                    placeholder="Search invoices..."
                    className={`${isMobile ? "text-sm h-8" : "max-w-xs"}`}
                  />
                </div>

                <TabsContent value="all" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="divide-y">
                      {getFilteredInvoices().length > 0 ? (
                        getFilteredInvoices().map((invoice) => (
                          <div
                            key={invoice.id}
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${isMobile ? "p-2" : "p-4"} hover:bg-muted/50 transition-colors`}
                          >
                            <div className="flex items-center">
                              <div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} rounded-full bg-primary/10 flex items-center justify-center text-primary`}>
                                {invoice.status === "Paid" ? (
                                  <Check className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                                ) : invoice.status === "Unpaid" ? (
                                  <BanknoteIcon className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                                ) : (
                                  <FileText className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                                )}
                              </div>
                              <div className="ml-3 min-w-0">
                                <div className="flex items-center">
                                  <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>{invoice.id}</p>
                                  <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs ${
                                    invoice.status === "Paid"
                                      ? "bg-green-100 text-green-800"
                                      : invoice.status === "Unpaid"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {invoice.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <span className={isMobile ? "text-[0.65rem]" : ""}>{invoice.clientName} • {formatDate(invoice.date)}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`${isMobile ? "mt-1 ml-11" : "mt-0"} sm:mt-0 flex items-center`}>
                              <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>{formatCurrency(invoice.amount)}</p>
                              <div className="ml-4 flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditInvoice(invoice)}
                                  title="Edit"
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {invoice.status === "Unpaid" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      // Open payment dialog with this invoice
                                      setIsRecordingPayment(true);
                                    }}
                                    title="Record Payment"
                                    className="h-8 w-8"
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View"
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`${isMobile ? "p-4 text-sm" : "p-6"} text-center text-muted-foreground`}>
                          <p>No invoices found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="draft" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="divide-y">
                      {getFilteredInvoices().length > 0 ? (
                        getFilteredInvoices().map((invoice) => (
                          <div
                            key={invoice.id}
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${isMobile ? "p-2" : "p-4"} hover:bg-muted/50 transition-colors`}
                          >
                            <div className="flex items-center">
                              <div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} rounded-full bg-primary/10 flex items-center justify-center text-primary`}>
                                <FileText className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                              </div>
                              <div className="ml-3 min-w-0">
                                <div className="flex items-center">
                                  <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>{invoice.id}</p>
                                  <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800`}>
                                    {invoice.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <span className={isMobile ? "text-[0.65rem]" : ""}>{invoice.clientName} • {formatDate(invoice.date)}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`${isMobile ? "mt-1 ml-11" : "mt-0"} sm:mt-0 flex items-center`}>
                              <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>{formatCurrency(invoice.amount)}</p>
                              <div className="ml-4 flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditInvoice(invoice)}
                                  title="Edit"
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View"
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`${isMobile ? "p-4 text-sm" : "p-6"} text-center text-muted-foreground`}>
                          <p>No draft invoices found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="unpaid" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="divide-y">
                      {getFilteredInvoices().length > 0 ? (
                        getFilteredInvoices().map((invoice) => (
                          <div
                            key={invoice.id}
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${isMobile ? "p-2" : "p-4"} hover:bg-muted/50 transition-colors`}
                          >
                            <div className="flex items-center">
                              <div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} rounded-full bg-primary/10 flex items-center justify-center text-primary`}>
                                <BanknoteIcon className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                              </div>
                              <div className="ml-3 min-w-0">
                                <div className="flex items-center">
                                  <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>{invoice.id}</p>
                                  <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800`}>
                                    {invoice.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <span className={isMobile ? "text-[0.65rem]" : ""}>{invoice.clientName} • {formatDate(invoice.date)}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`${isMobile ? "mt-1 ml-11" : "mt-0"} sm:mt-0 flex items-center`}>
                              <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>{formatCurrency(invoice.amount)}</p>
                              <div className="ml-4 flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditInvoice(invoice)}
                                  title="Edit"
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setIsRecordingPayment(true);
                                  }}
                                  title="Record Payment"
                                  className="h-8 w-8"
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View"
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`${isMobile ? "p-4 text-sm" : "p-6"} text-center text-muted-foreground`}>
                          <p>No unpaid invoices found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="paid" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="divide-y">
                      {getFilteredInvoices().length > 0 ? (
                        getFilteredInvoices().map((invoice) => (
                          <div
                            key={invoice.id}
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${isMobile ? "p-2" : "p-4"} hover:bg-muted/50 transition-colors`}
                          >
                            <div className="flex items-center">
                              <div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} rounded-full bg-primary/10 flex items-center justify-center text-primary`}>
                                <Check className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                              </div>
                              <div className="ml-3 min-w-0">
                                <div className="flex items-center">
                                  <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>{invoice.id}</p>
                                  <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800`}>
                                    {invoice.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <span className={isMobile ? "text-[0.65rem]" : ""}>{invoice.clientName} • {formatDate(invoice.date)}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`${isMobile ? "mt-1 ml-11" : "mt-0"} sm:mt-0 flex items-center`}>
                              <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>{formatCurrency(invoice.amount)}</p>
                              <div className="ml-4 flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditInvoice(invoice)}
                                  title="Edit"
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View"
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`${isMobile ? "p-4 text-sm" : "p-6"} text-center text-muted-foreground`}>
                          <p>No paid invoices found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </div>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
};

export default BillingPage;