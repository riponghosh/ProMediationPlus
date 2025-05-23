import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavSectionProps } from "./config";

// Shadcn UI components
import { Separator } from "@/components/ui/separator";

interface Props {
  data: NavSectionProps[];
  onCloseMobile?: () => void;
}

export default function AdminNavSection({ data, onCloseMobile }: Props) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-1">
      {data.map((section) => (
        <div key={section.subheader} className="px-3 py-1">
          <h2 className="mb-1 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
            {section.subheader}
          </h2>
          <div className="space-y-1">
            {section.items.map((item) => (
              <NavLink
                key={item.title}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                {item.icon && (
                  <item.icon className={cn(
                    "mr-2",
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  )} />
                )}
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
          {section !== data[data.length - 1] && (
            <Separator className="my-1" />
          )}
        </div>
      ))}
    </div>
  );
}