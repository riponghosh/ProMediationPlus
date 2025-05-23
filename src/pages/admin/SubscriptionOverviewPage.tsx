import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { 
  Search, 
  RefreshCw, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  DollarSign,
  BarChart4,
  ArrowRight,
  CreditCard,
  Building,
  UserCircle,
  Mail,
  Clock,
  Download
} from "lucide-react";

// Mock subscription data
const subscriptionStats = {
  totalSubscribers: 142,
  activeSubscribers: 128,
  mrr: 6249.50,
  arr: 74994.00,
  averageRevenue: 48.82,
  trialConversion: 62.5,
  churnRate: 3.2,
  growthRate: 8.7,
  usersByPlan: [
    { name: "Basic", count: 42, percentage: 32.8 },
    { name: "Professional", count: 65, percentage: 50.8 },
    { name: "Enterprise", count: 21, percentage: 16.4 }
  ],
  revenueByPlan: [
    { name: "Basic", amount: 839.58, percentage: 13.4 },
    { name: "Professional", amount: 3249.35, percentage: 52.0 },
    { name: "Enterprise", amount: 2160.57, percentage: 34.6 }
  ]
};

const activeSubscriptions = [
  {
    id: "sub-001",
    customer: {
      id: "cust-123",
      name: "Johnson Mediation Services",
      email: "mjohnson@example.com",
      avatar: null
    },
    plan: "Professional",
    billingCycle: "monthly",
    amount: 49.99,
    status: "active",
    startDate: "2024-11-15",
    nextBillingDate: "2025-05-15",
    paymentMethod: { 
      type: "card", 
      last4: "4242", 
      brand: "visa" 
    }
  },
  {
    id: "sub-002",
    customer: {
      id: "cust-124",
      name: "Smith & Associates",
      email: "robert.smith@example.com",
      avatar: null
    },
    plan: "Enterprise",
    billingCycle: "annual",
    amount: 999.99,
    status: "active",
    startDate: "2024-08-05",
    nextBillingDate: "2025-08-05",
    paymentMethod: { 
      type: "card", 
      last4: "1234", 
      brand: "mastercard" 
    }
  },
  {
    id: "sub-003",
    customer: {
      id: "cust-125",
      name: "Williams Legal Mediation",
      email: "jwilliams@example.com",
      avatar: null
    },
    plan: "Basic",
    billingCycle: "monthly",
    amount: 19.99,
    status: "past_due",
    startDate: "2025-01-20",
    nextBillingDate: "2025-05-20",
    paymentMethod: { 
      type: "card", 
      last4: "5678", 
      brand: "amex" 
    }
  },
  {
    id: "sub-004",
    customer: {
      id: "cust-126",
      name: "Davis Conflict Resolution",
      email: "sarah.davis@example.com",
      avatar: null
    },
    plan: "Professional",
    billingCycle: "annual",
    amount: 499.99,
    status: "active",
    startDate: "2024-06-10",
    nextBillingDate: "2025-06-10",
    paymentMethod: { 
      type: "card", 
      last4: "9012", 
      brand: "visa" 
    }
  },
  {
    id: "sub-005",
    customer: {
      id: "cust-127",
      name: "Miller Mediation Group",
      email: "tmiller@example.com",
      avatar: null
    },
    plan: "Enterprise",
    billingCycle: "monthly",
    amount: 99.99,
    status: "active",
    startDate: "2025-02-15",
    nextBillingDate: "2025-05-15",
    paymentMethod: { 
      type: "card", 
      last4: "3456", 
      brand: "discover" 
    }
  },
  {
    id: "sub-006",
    customer: {
      id: "cust-128",
      name: "Jennifer Wilson",
      email: "jwilson@example.com",
      avatar: null
    },
    plan: "Basic",
    billingCycle: "monthly",
    amount: 19.99,
    status: "trialing",
    startDate: "2025-04-20",
    nextBillingDate: "2025-05-20",
    paymentMethod: { 
      type: "card", 
      last4: "7890", 
      brand: "visa" 
    }
  },
  {
    id: "sub-007",
    customer: {
      id: "cust-129",
      name: "Taylor Mediation & Arbitration",
      email: "michael.taylor@example.com",
      avatar: null
    },
    plan: "Professional",
    billingCycle: "monthly",
    amount: 49.99,
    status: "active",
    startDate: "2024-12-05",
    nextBillingDate: "2025-05-05",
    paymentMethod: { 
      type: "card", 
      last4: "2345", 
      brand: "mastercard" 
    }
  },
  {
    id: "sub-008",
    customer: {
      id: "cust-130",
      name: "Anderson Dispute Resolution",
      email: "janderson@example.com",
      avatar: null
    },
    plan: "Enterprise",
    billingCycle: "annual",
    amount: 999.99,
    status: "active",
    startDate: "2025-03-01",
    nextBillingDate: "2026-03-01",
    paymentMethod: { 
      type: "card", 
      last4: "6789", 
      brand: "visa" 
    }
  },
  {
    id: "sub-009",
    customer: {
      id: "cust-131",
      name: "Thomas & Partners",
      email: "ethomas@example.com",
      avatar: null
    },
    plan: "Professional",
    billingCycle: "monthly",
    amount: 49.99,
    status: "canceled",
    startDate: "2024-09-15",
    nextBillingDate: "2025-05-15",
    paymentMethod: { 
      type: "card", 
      last4: "0123", 
      brand: "mastercard" 
    }
  },
  {
    id: "sub-010",
    customer: {
      id: "cust-132",
      name: "Martinez Mediation Center",
      email: "cmartinez@example.com",
      avatar: null
    },
    plan: "Basic",
    billingCycle: "annual",
    amount: 199.99,
    status: "active",
    startDate: "2024-10-10",
    nextBillingDate: "2025-10-10",
    paymentMethod: { 
      type: "card", 
      last4: "4567", 
      brand: "visa" 
    }
  }
];

export default function SubscriptionOverviewPage() {
  const isMobile = useIsMobile();
  const [subscriptions, setSubscriptions] = useState(activeSubscriptions);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";
  
  // Filter subscriptions based on search, plan and status
  const filteredSubscriptions = subscriptions.filter(sub => {
    const searchMatch = search === "" || 
      sub.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.customer.email.toLowerCase().includes(search.toLowerCase());
    
    const planMatch = planFilter === "all" || sub.plan.toLowerCase() === planFilter.toLowerCase();
    const statusMatch = statusFilter === "all" || sub.status === statusFilter;
    
    return searchMatch && planMatch && statusMatch;
  });
  
  // Handle refreshing data
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      // In real app, fetch fresh data
    }, 1000);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case "active":
        return <Badge className={`bg-green-100 text-green-800 hover:bg-green-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>Active</Badge>;
      case "past_due":
        return <Badge className={`bg-amber-100 text-amber-800 hover:bg-amber-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>Past Due</Badge>;
      case "trialing":
        return <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>Trialing</Badge>;
      case "canceled":
        return <Badge className={`bg-gray-100 text-gray-800 hover:bg-gray-100 ${isMobile ? "text-[0.65rem] px-1" : ""}`}>Canceled</Badge>;
      default:
        return <Badge variant="outline" className={isMobile ? "text-[0.65rem] px-1" : ""}>{status}</Badge>;
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch(method.brand) {
      case "visa":
        return "💳 Visa";
      case "mastercard":
        return "💳 Mastercard";
      case "amex":
        return "💳 Amex";
      case "discover":
        return "💳 Discover";
      default:
        return "💳 Card";
    }
  };

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Subscription Overview</h1>
          <p className="text-muted-foreground text-sm">
            Monitor revenue and subscription performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={handleRefresh} 
            disabled={isRefreshing} 
            className={isMobile ? "h-8 text-xs px-2.5" : ""}
          >
            {isRefreshing ? (
              <>
                <span className="animate-spin mr-1.5">◌</span>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className={`mr-1.5 ${iconSizeClass}`} />
                <span>Refresh</span>
              </>
            )}
          </Button>
          <Button 
            size={isMobile ? "sm" : "default"} 
            className={isMobile ? "h-8 text-xs px-2.5" : ""}
          >
            <Download className={`mr-1.5 ${iconSizeClass}`} />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className={`${isMobile ? "px-3 py-2" : "pb-2"}`}>
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-muted-foreground`}>
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 py-1" : ""}>
            <div className="flex items-center justify-between">
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
                {formatCurrency(subscriptionStats.mrr)}
              </div>
              <div className={`flex items-center ${isMobile ? "text-[0.65rem] px-1.5 py-0.5" : "text-sm px-2 py-0.5"} text-green-600 bg-green-100 rounded-full`}>
                <ArrowUpRight className={`${isMobile ? "mr-0.5 h-2.5 w-2.5" : "mr-1 h-4 w-4"}`} />
                8.2%
              </div>
            </div>
            <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-1`}>vs previous month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={`${isMobile ? "px-3 py-2" : "pb-2"}`}>
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-muted-foreground`}>
              Active Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 py-1" : ""}>
            <div className="flex items-center justify-between">
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
                {subscriptionStats.activeSubscribers}
              </div>
              <div className={`flex items-center ${isMobile ? "text-[0.65rem] px-1.5 py-0.5" : "text-sm px-2 py-0.5"} text-green-600 bg-green-100 rounded-full`}>
                <ArrowUpRight className={`${isMobile ? "mr-0.5 h-2.5 w-2.5" : "mr-1 h-4 w-4"}`} />
                3.5%
              </div>
            </div>
            <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-1`}>vs previous month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={`${isMobile ? "px-3 py-2" : "pb-2"}`}>
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-muted-foreground`}>
              Average Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 py-1" : ""}>
            <div className="flex items-center justify-between">
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
                {formatCurrency(subscriptionStats.averageRevenue)}
              </div>
              <div className={`flex items-center ${isMobile ? "text-[0.65rem] px-1.5 py-0.5" : "text-sm px-2 py-0.5"} text-green-600 bg-green-100 rounded-full`}>
                <ArrowUpRight className={`${isMobile ? "mr-0.5 h-2.5 w-2.5" : "mr-1 h-4 w-4"}`} />
                1.8%
              </div>
            </div>
            <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-1`}>per subscriber</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={`${isMobile ? "px-3 py-2" : "pb-2"}`}>
            <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-muted-foreground`}>
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 py-1" : ""}>
            <div className="flex items-center justify-between">
              <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
                {subscriptionStats.churnRate}%
              </div>
              <div className={`flex items-center ${isMobile ? "text-[0.65rem] px-1.5 py-0.5" : "text-sm px-2 py-0.5"} text-red-600 bg-red-100 rounded-full`}>
                <ArrowDownRight className={`${isMobile ? "mr-0.5 h-2.5 w-2.5" : "mr-1 h-4 w-4"}`} />
                0.3%
              </div>
            </div>
            <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-1`}>monthly average</p>
          </CardContent>
        </Card>
      </div>
      
      <div className={`grid grid-cols-1 lg:grid-cols-3 ${isMobile ? "gap-4" : "gap-6"}`}>
        <Card className="lg:col-span-2">
          <CardHeader className={isMobile ? "px-3 py-3" : ""}>
            <CardTitle className={isMobile ? "text-base" : ""}>Revenue Distribution</CardTitle>
            <CardDescription className={isMobile ? "text-xs" : ""}>
              Revenue breakdown by subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 py-1" : ""}>
            <div className={isMobile ? "space-y-3" : "space-y-4"}>
              {subscriptionStats.revenueByPlan.map((plan) => (
                <div key={plan.name} className={isMobile ? "space-y-1" : "space-y-2"}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`h-3 w-3 rounded-full mr-2 ${
                        plan.name === 'Basic' ? 'bg-blue-500' : 
                        plan.name === 'Professional' ? 'bg-indigo-500' : 
                        'bg-purple-500'
                      }`}></span>
                      <span className={isMobile ? "text-sm" : ""}>{plan.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>
                        {formatCurrency(plan.amount)}
                      </span>
                      <span className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground ml-2`}>
                        ({plan.percentage}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={plan.percentage} className="h-1.5" />
                </div>
              ))}
            </div>
            <div className={`border-t ${isMobile ? "pt-3 mt-3" : "pt-4 mt-4"}`}>
              <div className="flex justify-between items-center">
                <div className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-muted-foreground`}>
                  Total Monthly Revenue
                </div>
                <div className="font-semibold">{formatCurrency(subscriptionStats.mrr)}</div>
              </div>
              <div className={`flex justify-between items-center ${isMobile ? "mt-1.5" : "mt-2"}`}>
                <div className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-muted-foreground`}>
                  Projected Annual Revenue
                </div>
                <div className="font-semibold">{formatCurrency(subscriptionStats.arr)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className={isMobile ? "px-3 py-3" : ""}>
            <CardTitle className={isMobile ? "text-base" : ""}>Subscriber Distribution</CardTitle>
            <CardDescription className={isMobile ? "text-xs" : ""}>
              Subscribers by plan
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 py-1" : ""}>
            <div className={isMobile ? "space-y-5" : "space-y-8"}>
              {subscriptionStats.usersByPlan.map((plan) => (
                <div key={plan.name} className="flex items-center">
                  <div className={`${isMobile ? "h-7 w-7" : "h-8 w-8"} rounded-full mr-3 flex items-center justify-center text-white ${
                    plan.name === 'Basic' ? 'bg-blue-500' : 
                    plan.name === 'Professional' ? 'bg-indigo-500' : 
                    'bg-purple-500'
                  }`}>
                    {plan.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`${isMobile ? "text-sm" : ""} font-medium`}>{plan.name}</span>
                      <span className={isMobile ? "text-xs" : "text-sm"}>{plan.count} users</span>
                    </div>
                    <div className="flex items-center">
                      <Progress value={plan.percentage} className="h-1.5 flex-1" />
                      <span className={`${isMobile ? "text-[0.65rem]" : "text-xs"} ml-2 w-12 text-right`}>
                        {plan.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className={`flex justify-between items-center ${isMobile ? "pt-3 mt-1 border-t" : "pt-4 border-t"}`}>
                <div className={isMobile ? "text-xs" : "text-sm"}>Total Users</div>
                <div className="font-semibold">{subscriptionStats.activeSubscribers}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className={`${isMobile ? "h-[calc(100vh-450px)]" : "h-[calc(100vh-720px)]"} flex flex-col overflow-hidden`}>
        <CardHeader className={isMobile ? "px-3 py-3" : ""}>
          <div className="flex flex-col gap-2">
            <div>
              <CardTitle className={isMobile ? "text-base" : ""}>Active Subscriptions</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                All current subscribers and their status
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-[250px]">
                <Search className={`absolute left-2.5 top-${isMobile ? "2" : "2.5"} ${iconSizeClass} text-muted-foreground`} />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${isMobile ? "pl-7 h-8 text-sm" : "pl-8"}`}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select 
                  value={planFilter} 
                  onValueChange={setPlanFilter}
                >
                  <SelectTrigger className={`${isMobile ? "h-8 text-xs flex-1" : "w-[120px]"}`}>
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className={`${isMobile ? "h-8 text-xs flex-1" : "w-[120px]"}`}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "p-0 px-3" : ""}`}>
          {isMobile ? (
            // Mobile view - Card-based layout
            <div className="space-y-2 py-2">
              {filteredSubscriptions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No subscriptions match the current filters</p>
                </div>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <Card 
                    key={subscription.id}
                    className="border overflow-hidden"
                  >
                    <div className="px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center mr-1.5 text-xs font-medium">
                            {subscription.customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-medium">{subscription.customer.name}</div>
                            <div className="text-[0.65rem] text-muted-foreground">{subscription.customer.email}</div>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(subscription.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-1.5 text-[0.65rem]">
                        <div>
                          <div className="text-muted-foreground">Plan:</div>
                          <div className="font-medium">{subscription.plan}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Amount:</div>
                          <div className="font-medium">{formatCurrency(subscription.amount)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Next bill:</div>
                          <div className="font-medium">
                            {format(new Date(subscription.nextBillingDate), "MMM d")}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-1.5">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 py-0 px-2 text-xs"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            // Desktop view - Table layout
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="hidden sm:table-cell">Next Billing</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No subscriptions match the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2 text-xs font-medium">
                              {subscription.customer.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{subscription.customer.name}</div>
                              <div className="text-xs text-muted-foreground">{subscription.customer.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{subscription.plan}</div>
                          <div className="text-xs text-muted-foreground capitalize">{subscription.billingCycle}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {format(new Date(subscription.nextBillingDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(subscription.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(subscription.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <span className="sr-only">Manage</span>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className={`flex items-center justify-between bg-muted/50 border-t ${isMobile ? "px-3 py-2" : "px-6 py-3"}`}>
          <div className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </div>
          <div className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
            Last updated: {format(new Date(), isMobile ? "MM/dd HH:mm" : "MMM d, yyyy 'at' h:mm a")}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}