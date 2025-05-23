import { useState, useEffect, useRef } from "react";
import { Search, X, File, Users, FileText, Calendar, CheckSquare, User, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";

// Mock search results for now - in a real app, this would come from API/context
const mockSearchResults = {
  cases: [
    { id: 1, title: "Smith vs. Johnson", fileNumber: "CASE-001", path: "/cases/1" },
    { id: 2, title: "Property Dispute Resolution", fileNumber: "CASE-002", path: "/cases/2" },
    { id: 3, title: "Employment Contract Negotiation", fileNumber: "CASE-003", path: "/cases/3" },
  ],
  contacts: [
    { id: 1, name: "John Smith", email: "john@example.com", path: "/contacts/1" },
    { id: 2, title: "Sarah Johnson", email: "sarah@example.com", path: "/contacts/2" },
    { id: 3, title: "Michael Brown", email: "michael@example.com", path: "/contacts/3" },
  ],
  documents: [
    { id: 1, title: "Agreement to Mediate.pdf", path: "/documents/1" },
    { id: 2, title: "Settlement Agreement.docx", path: "/documents/2" },
    { id: 3, title: "Case Notes - Smith.pdf", path: "/documents/3" },
  ],
  sessions: [
    { id: 1, title: "Initial Consultation", date: "2025-04-25", path: "/calendar" },
    { id: 2, title: "Mediation Session 1", date: "2025-05-02", path: "/calendar" },
    { id: 3, title: "Follow-up Meeting", date: "2025-05-10", path: "/calendar" },
  ],
  tasks: [
    { id: 1, title: "Review case documents", status: "Pending", path: "/tasks" },
    { id: 2, title: "Schedule follow-up call", status: "Completed", path: "/tasks" },
    { id: 3, title: "Draft settlement proposal", status: "In Progress", path: "/tasks" },
  ],
};

type SearchResultType = "cases" | "contacts" | "documents" | "sessions" | "tasks";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any>({});
  const [activeCategory, setActiveCategory] = useState<SearchResultType | null>(null);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Handle click outside to close the search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isMobile) {
          setMobileSearchExpanded(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile]);

  // Focus input when mobile search is expanded
  useEffect(() => {
    if (mobileSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mobileSearchExpanded]);

  // Simple filter function - in a real app, this would be a backend call
  useEffect(() => {
    if (!searchTerm) {
      setResults({});
      setActiveCategory(null);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    const filteredResults = {
      cases: mockSearchResults.cases.filter(
        item => item.title.toLowerCase().includes(term) || item.fileNumber.toLowerCase().includes(term)
      ),
      contacts: mockSearchResults.contacts.filter(
        item => item.name?.toLowerCase().includes(term) || item.email?.toLowerCase().includes(term)
      ),
      documents: mockSearchResults.documents.filter(
        item => item.title.toLowerCase().includes(term)
      ),
      sessions: mockSearchResults.sessions.filter(
        item => item.title.toLowerCase().includes(term) || item.date.includes(term)
      ),
      tasks: mockSearchResults.tasks.filter(
        item => item.title.toLowerCase().includes(term) || item.status.toLowerCase().includes(term)
      ),
    };

    // Set active category to the first non-empty category
    const firstNonEmpty = Object.entries(filteredResults)
      .find(([_, items]) => (items as any[]).length > 0)?.[0] as SearchResultType | undefined;
      
    setActiveCategory(firstNonEmpty || null);
    setResults(filteredResults);
  }, [searchTerm]);

  // Navigate to item and close search
  const handleSelectItem = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setMobileSearchExpanded(false);
    setSearchTerm("");
  };

  // Get icon for category
  const getCategoryIcon = (category: SearchResultType) => {
    switch (category) {
      case "cases": return <File className="h-4 w-4" />;
      case "contacts": return <User className="h-4 w-4" />;
      case "documents": return <FileText className="h-4 w-4" />;
      case "sessions": return <Calendar className="h-4 w-4" />;
      case "tasks": return <CheckSquare className="h-4 w-4" />;
    }
  };

  // Get display name for category
  const getCategoryName = (category: SearchResultType) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        if (isMobile) {
          setMobileSearchExpanded(true);
        }
      }
      
      // Escape to close search
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        if (isMobile) {
          setMobileSearchExpanded(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMobile]);

  // Toggle mobile search
  const handleMobileSearchToggle = () => {
    setMobileSearchExpanded(!mobileSearchExpanded);
    setIsOpen(!mobileSearchExpanded);
    if (!mobileSearchExpanded) {
      // We're opening the search
      setSearchTerm("");
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {isMobile ? (
        <div>
          {/* Mobile: Search icon button aligned with hamburger menu */}
          <div className="fixed top-4 left-4 z-30">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-10 h-10 rounded-full p-0 border-2 border-primary shadow-sm bg-background/80"
              onClick={handleMobileSearchToggle}
            >
              <Search className="h-5 w-5 text-primary" />
            </Button>
          </div>
          
          {/* Expandable search area with reduced spacing */}
          <AnimatePresence>
            {mobileSearchExpanded && (
              <motion.div
                key="search-expanded-container"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed top-16 left-0 right-0 z-30 px-4"
              >
                <div className="bg-background border border-muted rounded-md shadow-md p-2 flex items-center">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search cases, contacts, documents..."
                    className="flex-1 h-10 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-8 w-8 p-0"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        // Desktop: Full search bar width matched to the quick actions card
        <div 
          className={`max-w-full flex items-center border rounded-md ${isOpen ? "ring-1 ring-primary" : "bg-muted/40 hover:bg-muted/80"} cursor-pointer transition-all px-3 py-1.5`}
          onClick={() => setIsOpen(true)}
        >
          <Search className="h-4 w-4 text-primary mr-2" />
          {isOpen ? (
            <Input
              type="text"
              placeholder="Search cases, contacts, documents..."
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          ) : (
            <span className="text-sm text-muted-foreground flex-1">Search...</span>
          )}
          {isOpen && (
            <Button
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0 ml-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setSearchTerm("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {!isOpen && (
            <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      )}

      {/* Search results dropdown */}
      {isOpen && (searchTerm || Object.values(results).some(arr => (arr as any[]).length > 0)) && (
        <div className={`${isMobile ? "fixed top-[4.5rem] left-0 right-0 mx-4 z-30" : "absolute top-full left-0 right-0 mt-1"} border rounded-md shadow-lg bg-background overflow-hidden`}>
          <div className="max-h-[60vh] overflow-auto">
            {Object.keys(results).length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? "No results found" : "Type to search..."}
              </div>
            ) : (
              <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
                {/* Categories sidebar (desktop only) */}
                {!isMobile && (
                  <div className="w-1/4 border-r bg-muted/30">
                    {Object.entries(results).map(([category, items]) => {
                      const count = (items as any[]).length;
                      if (count === 0) return null;
                      
                      return (
                        <button
                          key={category}
                          className={`flex items-center w-full px-3 py-2 text-sm ${
                            activeCategory === category ? "bg-muted font-medium" : ""
                          } hover:bg-muted/80 transition-colors`}
                          onClick={() => setActiveCategory(category as SearchResultType)}
                        >
                          {getCategoryIcon(category as SearchResultType)}
                          <span className="ml-2">{getCategoryName(category as SearchResultType)}</span>
                          <span className="ml-auto bg-muted-foreground/20 px-2 py-0.5 rounded-full text-xs">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Results panel */}
                <div className={`${isMobile ? "w-full" : "w-3/4"} divide-y`}>
                  {isMobile ? (
                    // Mobile: Show all categories in one list
                    Object.entries(results).map(([category, items]) => {
                      const itemsArray = items as any[];
                      if (itemsArray.length === 0) return null;
                      
                      return (
                        <div key={category} className="py-2">
                          <div className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase flex items-center">
                            {getCategoryIcon(category as SearchResultType)}
                            <span className="ml-2">{getCategoryName(category as SearchResultType)}</span>
                          </div>
                          <div className="mt-1">
                            {itemsArray.slice(0, 3).map((item) => (
                              <button
                                key={item.id}
                                className="w-full text-left px-4 py-2 hover:bg-muted/50 flex items-center justify-between"
                                onClick={() => handleSelectItem(item.path)}
                              >
                                <div>
                                  <div className="text-sm font-medium">{item.title || item.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.fileNumber || item.email || item.date || item.status}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Desktop: Show only active category
                    activeCategory && results[activeCategory]?.length > 0 ? (
                      results[activeCategory].map((item: any) => (
                        <button
                          key={item.id}
                          className="w-full text-left px-4 py-3 hover:bg-muted/50 flex items-center justify-between"
                          onClick={() => handleSelectItem(item.path)}
                        >
                          <div>
                            <div className="text-sm font-medium">{item.title || item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.fileNumber || item.email || item.date || item.status}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No results in this category
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer with keyboard shortcuts - desktop only */}
          {!isMobile && (
            <div className="border-t p-2 flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border ml-1">↓</kbd>
                  <span className="ml-1">to navigate</span>
                </div>
                <div className="flex items-center">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border">Enter</kbd>
                  <span className="ml-1">to select</span>
                </div>
              </div>
              <div className="flex items-center">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border">Esc</kbd>
                <span className="ml-1">to close</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}