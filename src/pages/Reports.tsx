import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Keep Input import if used elsewhere, otherwise remove
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  Users,
  FileText,
  PieChart as PieChartIcon,
  LineChart,
  TrendingUp,
  Filter
} from "lucide-react";
import { ResponsiveContainer, BarChart as RechartBarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

// Mock data (assuming it remains the same)
const billingByMatter = [
  { name: "Smith vs. Johnson", hours: 24, amount: 6000 },
  { name: "Property Dispute", hours: 18, amount: 4500 },
  { name: "Brown Employment", hours: 12, amount: 3000 },
  { name: "Wilson Family", hours: 8, amount: 2000 },
  { name: "Corporate Contract", hours: 16, amount: 4000 },
];
const timeAllocation = [
  { name: "Client Meetings", value: 35 },
  { name: "Document Preparation", value: 25 },
  { name: "Research", value: 15 },
  { name: "Court Appearances", value: 10 },
  { name: "Administrative", value: 15 },
];
const monthlyRevenue = [
  { name: "Jan", revenue: 12000 },
  { name: "Feb", revenue: 15000 },
  { name: "Mar", revenue: 11000 },
  { name: "Apr", revenue: 16500 },
  { name: "May", revenue: 19500 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsPage = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 shadow-sm rounded-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-primary">
            {`Hours: ${payload[0].value}`}
          </p>
          <p className="text-xs text-secondary">
            {`Billing: ${formatCurrency(payload[1].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper for icon size - matching Settings.tsx
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <Layout>
      <div className={`flex flex-col h-full ${isMobile ? "space-y-4" : "space-y-6"}`}>
        {/* Header Section (unchanged) */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Reports</h1>
            <p className="text-muted-foreground text-sm">
              View insights and analytics about your legal practice
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-2"
            >
              <Calendar className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              {isMobile ? "30d" : "Last 30 Days"}
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-2"
            >
              <Download className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              {isMobile ? "Export" : "Export Reports"}
            </Button>
          </div>
        </div>

        {/* Summary Cards - Two Columns starting from Mobile (as per previous correction) */}
        <div className="grid gap-4 grid-cols-2">
          {/* Card 1: Total Revenue */}
          <Card>
            <CardHeader className={`pb-2 ${isMobile ? "p-3" : ""}`}>
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-3 pt-0" : ""}>
              <div className="flex items-center">
                <div className="mr-2">
                  <DollarSign className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-primary`} />
                </div>
                <div>
                  <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>{formatCurrency(19500)}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    <span>+12.5% from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Billable Hours */}
          <Card>
            <CardHeader className={`pb-2 ${isMobile ? "p-3" : ""}`}>
              <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-3 pt-0" : ""}>
              <div className="flex items-center">
                <div className="mr-2">
                  <Clock className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-blue-600`} />
                </div>
                <div>
                  <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>78</div>
                  <div className="flex items-center text-xs text-amber-600">
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                    <span>-4.2% from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Active Matters */}
          <Card>
            <CardHeader className={`pb-2 ${isMobile ? "p-3" : ""}`}>
              <CardTitle className="text-sm font-medium">Active Matters</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-3 pt-0" : ""}>
              <div className="flex items-center">
                <div className="mr-2">
                  <FileText className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-purple-600`} />
                </div>
                <div>
                  <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>12</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    <span>+2 from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Active Clients */}
          <Card>
            <CardHeader className={`pb-2 ${isMobile ? "p-3" : ""}`}>
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-3 pt-0" : ""}>
              <div className="flex items-center">
                <div className="mr-2">
                  <Users className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-green-600`} />
                </div>
                <div>
                  <div className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>8</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    <span>+1 from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section - Updated to match Settings.tsx styling */}
        <Card className="flex flex-col w-full">
          <CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"} w-full`}>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`
                  grid ${isMobile ? "grid-cols-4" : "grid-cols-4"}
                  w-full
                  h-auto p-1
                  bg-muted rounded-lg
                  gap-1
                  ${!isMobile ? 'md:w-auto md:inline-grid' : ''}
                `}>
                <TabsTrigger 
                  value="overview" 
                  className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                >
                  <BarChart className={iconSizeClass} />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                >
                  <TrendingUp className={iconSizeClass} />
                  Billing
                </TabsTrigger>
                <TabsTrigger 
                  value="time" 
                  className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                >
                  <PieChartIcon className={iconSizeClass} />
                  {isMobile ? "Time" : "Time Usage"}
                </TabsTrigger>
                <TabsTrigger 
                  value="custom" 
                  className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                >
                  <Filter className={iconSizeClass} />
                  Custom
                </TabsTrigger>
              </TabsList>

              <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-0"} sm:flex-row sm:justify-between sm:items-center ${isMobile ? "mt-2 mb-1" : "mt-4 mb-2"}`}>
                <CardTitle className={isMobile ? "text-base" : ""}>
                  {activeTab === "overview" && "Practice Overview"}
                  {activeTab === "billing" && "Billing Analysis"}
                  {activeTab === "time" && "Time Allocation"}
                  {activeTab === "custom" && "Custom Reports"}
                </CardTitle>
              </div>

              <TabsContent value="overview" className="m-0 p-0 w-full">
                <div className="w-full">
                  <Card className="w-full border-0 shadow-none">
                    <CardHeader className={`${isMobile ? "p-3" : "p-4"}`}>
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <CardDescription>Revenue trend over past months</CardDescription>
                    </CardHeader>
                    <CardContent className={`${isMobile ? "p-3" : "p-4"} pt-0`}>
                      <div className={`${isMobile ? "h-60" : "h-72"} w-full`}>
                        <ResponsiveContainer width="99%" height="100%">
                          <RechartBarChart
                            data={monthlyRevenue}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue ($)" fill="#8884d8" />
                          </RechartBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="m-0 p-0 w-full">
                <div className="w-full">
                  <Card className="w-full border-0 shadow-none">
                    <CardHeader className={`${isMobile ? "p-3" : "p-4"}`}>
                      <CardTitle className="text-sm font-medium">Billing by Matter</CardTitle>
                      <CardDescription>Hours billed and revenue by matter</CardDescription>
                    </CardHeader>
                    <CardContent className={`${isMobile ? "p-3" : "p-4"} pt-0`}>
                      <div className={`${isMobile ? "h-60" : "h-80"} w-full`}>
                        <ResponsiveContainer width="99%" height="100%">
                          <RechartBarChart
                            data={billingByMatter}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <XAxis dataKey="name" tickFormatter={(value) => value.split(' ')[0]} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="hours" name="Hours" fill="#8884d8" />
                            <Bar yAxisId="right" dataKey="amount" name="Amount ($)" fill="#82ca9d" />
                          </RechartBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="time" className="m-0 overflow-auto">
                {/* Time Content - Now with the Time Allocation card from Overview */}
                <CardContent className="p-0 sm:p-4">
                  <Card>
                    <CardHeader className={`${isMobile ? "p-3" : "p-4"}`}>
                      <CardTitle className="text-sm font-medium">Time Allocation</CardTitle>
                      <CardDescription>How your time is distributed</CardDescription>
                    </CardHeader>
                    <CardContent className={`${isMobile ? "p-3" : "p-4"} pt-0`}>
                      <div className={`${isMobile ? "h-72" : "h-80"} flex flex-col items-center justify-center`}>
                        <ResponsiveContainer width="100%" height="75%">
                          <PieChart>
                            <Pie
                              data={timeAllocation}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={isMobile ? 80 : 100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {timeAllocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Redesigned more compact legend */}
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                          {timeAllocation.map((entry, index) => (
                            <div key={`legend-${index}`} className="flex items-center">
                              <div
                                className="w-3 h-3 mr-1 rounded-sm"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                                {entry.name}: {entry.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </TabsContent>

              <TabsContent value="custom" className="m-0 overflow-auto">
                {/* ...existing custom content... */}
                <CardContent className={`text-center ${isMobile ? "p-4" : "p-8"} text-muted-foreground`}>
                  <div className="mx-auto max-w-sm">
                    <LineChart className="mx-auto h-10 w-10 mb-2" />
                    <h3 className="font-medium">Create Custom Report</h3>
                    <p className={`${isMobile ? "text-xs" : "text-sm"} mt-1 mb-4`}>
                      Select parameters and data points to generate a customized report
                    </p>
                    <Button className="mx-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      Start Report Builder
                    </Button>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportsPage;