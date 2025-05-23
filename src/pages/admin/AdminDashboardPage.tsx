import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlobalSearch } from "@/components/layout/global-search";
import {
  BarChart3,
  Users,
  PieChart,
  ArrowUpRight,
  ArrowRight,
  LineChart,
  Download,
  RefreshCcw,
  Calendar,
  Menu,
  X,
  Search
} from "lucide-react";

export default function AdminDashboardPage() {
  const isMobile = useIsMobile();
  const [timeframe, setTimeframe] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor your application metrics and performance</p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">534</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                8%
              </span>
              increase from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                12%
              </span>
              increase from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                3.2%
              </span>
              increase from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Activity across the platform over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Placeholder for a chart or activity list */}
              <div className="h-[200px] md:h-[300px] bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Activity graph placeholder</p>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Section - Added from MetricsPage */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6">
            <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold`}>System Metrics</h2>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className={`w-[180px] ${isMobile ? "h-8 text-sm" : ""}`}>
                  <Calendar className={isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"} />
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="outline" className={isMobile ? "h-8 w-8" : ""}>
                <RefreshCcw className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Card>
              <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? "pb-1.5 px-3 py-3" : "pb-2"}`}>
                <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>System Load</CardTitle>
                <LineChart className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              </CardHeader>
              <CardContent className={isMobile ? "px-3 py-3" : ""}>
                <div className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>28%</div>
                <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-0.5`}>
                  Average over {timeframe === "7d" ? "7 days" : timeframe === "30d" ? "30 days" : timeframe === "90d" ? "90 days" : "1 year"}
                </p>
                <div className={`mt-${isMobile ? "3" : "4"} h-[60px] bg-muted/20 rounded-md`}></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? "pb-1.5 px-3 py-3" : "pb-2"}`}>
                <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>API Requests</CardTitle>
                <BarChart3 className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              </CardHeader>
              <CardContent className={isMobile ? "px-3 py-3" : ""}>
                <div className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>2.4M</div>
                <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-0.5`}>
                  Total for {timeframe === "7d" ? "7 days" : timeframe === "30d" ? "30 days" : timeframe === "90d" ? "90 days" : "1 year"}
                </p>
                <div className={`mt-${isMobile ? "3" : "4"} h-[60px] bg-muted/20 rounded-md`}></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex flex-row items-center justify-between ${isMobile ? "pb-1.5 px-3 py-3" : "pb-2"}`}>
                <CardTitle className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>Error Rate</CardTitle>
                <PieChart className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              </CardHeader>
              <CardContent className={isMobile ? "px-3 py-3" : ""}>
                <div className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>0.12%</div>
                <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground mt-0.5`}>
                  Average for {timeframe === "7d" ? "7 days" : timeframe === "30d" ? "30 days" : timeframe === "90d" ? "90 days" : "1 year"}
                </p>
                <div className={`mt-${isMobile ? "3" : "4"} h-[60px] bg-muted/20 rounded-md`}></div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="usage" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
            <TabsList className={isMobile ? "grid w-full grid-cols-3 gap-1 text-xs h-8" : ""}>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>

            <TabsContent value="usage" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
              <Card>
                <CardHeader className={isMobile ? "px-3 py-3" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Usage Metrics</CardTitle>
                  <CardDescription className={isMobile ? "text-xs" : ""}>User activity and engagement statistics</CardDescription>
                </CardHeader>
                <CardContent className={`h-[400px] relative ${isMobile ? "px-3" : ""}`}>
                  <div className="absolute top-0 right-0 p-4">
                    <Button variant="outline" className={isMobile ? "h-7 text-xs" : "h-8"}>
                      <Download className={isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"} />
                      Export
                    </Button>
                  </div>
                  <div className="h-full bg-muted/20 rounded-md flex items-center justify-center">
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Usage chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
              <Card>
                <CardHeader className={isMobile ? "px-3 py-3" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Performance Metrics</CardTitle>
                  <CardDescription className={isMobile ? "text-xs" : ""}>System performance and response times</CardDescription>
                </CardHeader>
                <CardContent className={`h-[400px] ${isMobile ? "px-3" : ""}`}>
                  <div className="h-full bg-muted/20 rounded-md flex items-center justify-center">
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Performance chart placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className={`${isMobile ? "space-y-3" : "space-y-4"}`}>
              <Card>
                <CardHeader className={isMobile ? "px-3 py-3" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Error Logs</CardTitle>
                  <CardDescription className={isMobile ? "text-xs" : ""}>System errors and exceptions</CardDescription>
                </CardHeader>
                <CardContent className={`h-[400px] ${isMobile ? "px-3" : ""}`}>
                  <div className="h-full bg-muted/20 rounded-md flex items-center justify-center">
                    <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Error logs placeholder</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Detailed metrics analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Analytics content will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Downloadable reports and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Reports content will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}