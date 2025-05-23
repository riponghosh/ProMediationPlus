import { SidebarNav } from "./sidebar-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Chatbot } from "@/components/dashboard/chatbot";
import { GlobalSearch } from "./global-search";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);

  // Reset scroll position when navigating on mobile
  useEffect(() => {
    if (isMobile && location.pathname !== prevPath) {
      window.scrollTo(0, 0);
      setPrevPath(location.pathname);
    }
  }, [location.pathname, isMobile, prevPath]);

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      <SidebarNav />
      <main className={`flex-1 transition-all duration-300 ${isMobile ? 'ml-0 pt-12' : 'ml-16 md:ml-64'} p-4 md:p-8 overflow-x-hidden overflow-y-auto`}>
        {/* Global Search Bar positioned at the top with same width as first grid column */}
        <div className="mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <GlobalSearch />
          </div>
          <div className="hidden md:block md:col-span-1"></div>
        </div>
        {children}
      </main>
      <Chatbot />
    </div>
  );
}