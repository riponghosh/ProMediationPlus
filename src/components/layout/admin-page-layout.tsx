import React from "react";
import { Layout } from "@/components/layout/layout";
import { Card } from "@/components/ui/card";
import { useMobileStyling } from "@/lib/mobileStyling";

interface AdminPageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  fullWidth?: boolean;
}

export function AdminPageLayout({ 
  children, 
  title, 
  subtitle, 
  actions,
  fullWidth = false
}: AdminPageLayoutProps) {
  const { isMobile, headerStyles } = useMobileStyling();
  
  return (
    <Layout>
      <div className={headerStyles.spacing}>
        {/* Header with title, subtitle, and optional action buttons */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <div>
            <h1 className={`${headerStyles.title} font-bold tracking-tight`}>{title}</h1>
            {subtitle && <p className={headerStyles.subtitle}>{subtitle}</p>}
          </div>
          
          {actions && (
            <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
              {actions}
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className={fullWidth ? "w-full" : "max-w-6xl"}>
          {children}
        </div>
      </div>
    </Layout>
  );
}