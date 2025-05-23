import { useIsMobile } from "@/hooks/use-mobile";

// Centralized styling for consistent mobile experience across all admin pages
export const useMobileStyling = () => {
  const isMobile = useIsMobile();
  
  // Header styles
  const headerStyles = {
    title: isMobile ? "text-xl" : "text-2xl md:text-3xl",
    subtitle: "text-sm text-muted-foreground mt-1",
    spacing: isMobile ? "space-y-4" : "space-y-6",
  };

  // Card styles
  const cardStyles = {
    header: isMobile ? "px-3 py-3" : "",
    title: isMobile ? "text-base" : "",
    description: isMobile ? "text-xs" : "",
    content: isMobile ? "px-3 py-3" : "",
    footer: `flex justify-end border-t ${isMobile ? "px-3 py-3" : "px-6 py-4"}`,
  };

  // Tab styles
  const tabStyles = {
    container: isMobile ? "space-y-3" : "space-y-4",
    list: `
      grid ${isMobile ? "grid-cols-2 grid-rows-3" : "grid-cols-2 md:grid-cols-6"}
      w-full
      h-auto p-1
      bg-muted rounded-lg
      gap-1
      ${!isMobile ? 'md:w-auto md:inline-grid' : ''}
    `,
    trigger: `
      flex items-center justify-center gap-1.5
      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
      rounded-md
      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
    `,
  };

  // Form element styles
  const formStyles = {
    label: isMobile ? "text-sm" : "",
    input: isMobile ? "h-8 text-sm" : "",
    helperText: isMobile ? "text-[0.65rem]" : "text-xs",
    spacing: isMobile ? "space-y-3" : "space-y-4",
  };

  // Icon sizes
  const iconSizes = {
    standard: isMobile ? "h-3.5 w-3.5" : "h-5 w-5",
    small: isMobile ? "h-3 w-3" : "h-4 w-4",
    button: isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4",
  };

  // Button styles
  const buttonStyles = {
    standard: isMobile ? "h-8 text-xs" : "",
  };

  // Table styles
  const tableStyles = {
    cell: isMobile ? "py-2 px-2 text-xs" : "",
  };

  // Switch styles
  const switchStyles = {
    standard: isMobile ? "h-4 w-7" : "",
  };

  return {
    isMobile,
    headerStyles,
    cardStyles,
    tabStyles,
    formStyles,
    iconSizes,
    buttonStyles,
    tableStyles,
    switchStyles,
  };
};