import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Inbox, Send, Archive, Trash, Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Email() {
  const isMobile = useIsMobile();
  
  // Helper for icon size - matching Settings.tsx
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Email</h1>
            <p className="text-muted-foreground text-sm">
              Manage and organize your emails
            </p>
          </div>
          <Button size={isMobile ? "sm" : "default"} className="flex items-center gap-2 self-start">
            <Edit className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            {isMobile ? "New" : "Compose"}
          </Button>
        </div>
        
        <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
          <CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"}`}>
            <div className="flex justify-between items-center">
              <Tabs defaultValue="inbox" className="w-full">
                {/* === UPDATED TabsList to match Settings.tsx === */}
                <TabsList className={`
                  grid ${isMobile ? "grid-cols-4" : "grid-cols-4"}
                  w-full
                  h-auto p-1
                  bg-muted rounded-lg
                  gap-1
                  ${!isMobile ? 'md:w-auto md:inline-grid' : ''}
                `}>
                  <TabsTrigger 
                    value="inbox" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <Inbox className={iconSizeClass} />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sent" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <Send className={iconSizeClass} />
                    Sent
                  </TabsTrigger>
                  <TabsTrigger 
                    value="archive" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <Archive className={iconSizeClass} />
                    {isMobile ? "Arch" : "Archive"}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trash" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <Trash className={iconSizeClass} />
                    Trash
                  </TabsTrigger>
                </TabsList>
                {/* === END UPDATED TabsList === */}
                
                <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-0"} sm:flex-row sm:justify-between sm:items-center ${isMobile ? "mt-2 mb-1" : "mt-4 mb-2"}`}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Inbox</CardTitle>
                  <Input placeholder="Search emails..." className={`${isMobile ? "text-sm h-8" : "max-w-xs"}`} />
                </div>
                
                <TabsContent value="inbox" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="divide-y">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i} 
                          className={`${isMobile ? "p-2" : "p-4"} hover:bg-gray-50 cursor-pointer flex items-start gap-2 sm:gap-4`}
                        >
                          <div className={`flex-shrink-0 ${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-blue-100 rounded-full flex items-center justify-center`}>
                            <span className={`text-blue-700 ${isMobile ? "text-xs" : "text-sm"} font-medium`}>C{i}</span>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between">
                              <p className={`${isMobile ? "text-xs" : ""} font-medium truncate max-w-[60%]`}>Client {i}</p>
                              <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>10:{i}0 AM</p>
                            </div>
                            <p className={`${isMobile ? "text-xs" : ""} font-medium truncate`}>Case Update - Meeting Notes</p>
                            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 truncate`}>
                              Please find attached the notes from our recent mediation session regarding...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="sent" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="divide-y">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i} 
                          className={`${isMobile ? "p-2" : "p-4"} hover:bg-gray-50 cursor-pointer flex items-start gap-2 sm:gap-4`}
                        >
                          <div className={`flex-shrink-0 ${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-green-100 rounded-full flex items-center justify-center`}>
                            <span className={`text-green-700 ${isMobile ? "text-xs" : "text-sm"} font-medium`}>C{i}</span>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between">
                              <p className={`${isMobile ? "text-xs" : ""} font-medium truncate max-w-[60%]`}>To: Client {i}</p>
                              <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>Yesterday</p>
                            </div>
                            <p className={`${isMobile ? "text-xs" : ""} font-medium truncate`}>Mediation Follow-up</p>
                            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 truncate`}>
                              Thank you for your participation in the mediation session. As discussed...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="archive" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="divide-y">
                      {[1, 2].map((i) => (
                        <div 
                          key={i} 
                          className={`${isMobile ? "p-2" : "p-4"} hover:bg-gray-50 cursor-pointer flex items-start gap-2 sm:gap-4`}
                        >
                          <div className={`flex-shrink-0 ${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-purple-100 rounded-full flex items-center justify-center`}>
                            <span className={`text-purple-700 ${isMobile ? "text-xs" : "text-sm"} font-medium`}>A{i}</span>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between">
                              <p className={`${isMobile ? "text-xs" : ""} font-medium truncate max-w-[60%]`}>Archived Thread {i}</p>
                              <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500`}>Mar 15</p>
                            </div>
                            <p className={`${isMobile ? "text-xs" : ""} font-medium truncate`}>Previous Case Resolution</p>
                            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-600 truncate`}>
                              This is to confirm that we have reached a settlement in the matter of...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="trash" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <div className="divide-y">
                      <div className={`${isMobile ? "p-4" : "p-8"} text-center text-gray-500`}>
                        No items in trash
                      </div>
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
}