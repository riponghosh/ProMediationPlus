import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Calendar,
  FileText,
  LayoutDashboard,
  CheckSquare,
  Briefcase,
  Users,
  FileSpreadsheet,
  CreditCard,
  BarChart,
  Settings,
  HardDrive,
  Mail,
  FileOutput,
  Menu,
  X,
  MessageSquare,
  Clock,
  ClipboardCheck,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Case Files",
    href: "/case-files",
    icon: Briefcase,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Contacts",
    href: "/contacts",
    icon: Users,
  },
  {
    title: "Email",
    href: "/email",
    icon: Mail,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Storage",
    href: "/storage",
    icon: HardDrive,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: FileOutput,
  },
  {
    title: "Forms",
    href: "/forms",
    icon: ClipboardCheck,
  },
  {
    title: "Guides",
    href: "/guides",
    icon: BookOpen,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: ShieldCheck,
  },
];

export function SidebarNav() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isCollapsed = isMobile;
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto collapse sidebar on navigation for mobile
  useEffect(() => {
    if (isMobile && location.pathname !== prevPath) {
      setPrevPath(location.pathname);
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile, prevPath]);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <>
      {/* Regular sidebar - hidden on mobile when menu is not open */}
      <div className="relative">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
            isCollapsed ? "w-16" : "w-64",
            isMobile ? "hidden" : "block"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className={cn("flex items-center", isCollapsed && "justify-center w-full")}>
              {!isCollapsed && (
                <h1 className="text-xl font-bold text-mediator-700">Andrew Rooney Legal</h1>
              )}
              {isCollapsed && (
                <span className="text-2xl font-bold text-mediator-700">AR</span>
              )}
            </div>
            <div className="w-8" /> {/* Spacer to maintain layout */}
          </div>
          <Separator />
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    location.pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile hamburger button - explicitly positioned top right with higher z-index */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            // Increased z-index to ensure it's on top
            className="fixed top-4 right-4 z-50 p-3 rounded-md bg-mediator-600 text-white shadow-lg hover:bg-mediator-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Mobile menu overlay */}
      {isMobile && (
        <div 
          className={`fixed inset-0 bg-background z-50 transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header with app name and close button */}
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold text-mediator-700">Andrew Rooney Legal</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Mobile navigation items - reduced vertical spacing */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-4 py-2 px-4 rounded-lg text-lg transition-all",
                        location.pathname === item.href
                          ? "bg-mediator-50 text-mediator-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
