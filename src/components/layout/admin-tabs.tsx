import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobileStyling } from "@/lib/mobileStyling";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface AdminTabsListProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  tabs: TabItem[];
}

export function AdminTabsList({
  defaultValue,
  value,
  onValueChange,
  tabs
}: AdminTabsListProps) {
  const { tabStyles, iconSizes } = useMobileStyling();

  return (
    <TabsList className={tabStyles.list}>
      {tabs.map((tab) => (
        <TabsTrigger 
          key={tab.value}
          value={tab.value}
          className={tabStyles.trigger}
        >
          {tab.icon && <span className={iconSizes.standard}>{tab.icon}</span>}
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}