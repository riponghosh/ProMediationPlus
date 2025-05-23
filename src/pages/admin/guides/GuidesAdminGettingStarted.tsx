import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  ChevronLeft, 
  Save,
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  BookmarkCheck, 
  CircleCheck, 
  CircleDashed, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Eye,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

// Initial guide structure data - this would typically be fetched from an API
const initialGuideContent = {
  title: "Getting Started with Mediation: A Comprehensive Guide for Divorce and Separation in Ireland",
  description: "A complete guide for understanding and practicing family mediation in Ireland",
  chaptersCount: 10,
  completedChapters: 2,
  totalSections: 30,
  completedSections: 6,
  chapters: [
    {
      id: "chapter1",
      title: "Introduction to Family Mediation in Ireland",
      description: "Understanding family mediation in the Irish context",
      completed: true,
      sections: [
        { id: "c1s1", title: "What is Family Mediation in Ireland?", completed: true, duration: "5 min read" },
        { id: "c1s2", title: "The Irish Context", completed: true, duration: "7 min read" },
        { id: "c1s3", title: "Benefits of Family Mediation in Ireland", completed: true, duration: "6 min read" },
      ]
    },
    {
      id: "chapter2",
      title: "Irish Mediation Regulatory Framework",
      description: "Understanding the legal foundation for mediation practice in Ireland",
      completed: true,
      sections: [
        { id: "c2s1", title: "The Mediation Act 2017", completed: true, duration: "10 min read" },
        { id: "c2s2", title: "Professional Standards and Accreditation", completed: true, duration: "8 min read" },
        { id: "c2s3", title: "Family Law in Ireland", completed: true, duration: "12 min read" },
      ]
    },
    {
      id: "chapter3",
      title: "Core Mediation Principles and Ethics",
      description: "Essential principles and ethical standards for family mediation",
      completed: false,
      sections: [
        { id: "c3s1", title: "Fundamental Principles", completed: false, duration: "8 min read" },
        { id: "c3s2", title: "Ethical Standards for Irish Family Mediators", completed: false, duration: "10 min read" },
      ]
    },
    {
      id: "chapter4",
      title: "Essential Skills for Family Mediators",
      description: "Key skills required for effective family mediation",
      completed: false,
      sections: [
        { id: "c4s1", title: "Communication Skills", completed: false, duration: "9 min read" },
        { id: "c4s2", title: "Emotional Intelligence", completed: false, duration: "7 min read" },
        { id: "c4s3", title: "Negotiation and Problem-Solving", completed: false, duration: "8 min read" },
      ]
    },
    {
      id: "chapter5",
      title: "Pre-Mediation Preparation",
      description: "Preparing for effective mediation sessions",
      completed: false,
      sections: [
        { id: "c5s1", title: "Initial Contact and Screening", completed: false, duration: "8 min read" },
        { id: "c5s2", title: "Information Gathering", completed: false, duration: "7 min read" },
        { id: "c5s3", title: "Session Planning", completed: false, duration: "6 min read" },
      ]
    },
    {
      id: "chapter6",
      title: "The Mediation Process: Step by Step",
      description: "A detailed walkthrough of the mediation process",
      completed: false,
      sections: [
        { id: "c6s1", title: "Opening the Session", completed: false, duration: "8 min read" },
        { id: "c6s2", title: "Issue Identification", completed: false, duration: "7 min read" },
        { id: "c6s3", title: "Exploration and Negotiation", completed: false, duration: "10 min read" },
        { id: "c6s4", title: "Reaching and Documenting Agreement", completed: false, duration: "9 min read" },
      ]
    },
    {
      id: "chapter7",
      title: "Legal Considerations in Irish Family Mediation",
      description: "Understanding the legal aspects of family mediation in Ireland",
      completed: false,
      sections: [
        { id: "c7s1", title: "Separation Agreements", completed: false, duration: "10 min read" },
        { id: "c7s2", title: "Divorce Considerations", completed: false, duration: "11 min read" },
        { id: "c7s3", title: "Child-Related Legal Frameworks", completed: false, duration: "9 min read" },
      ]
    },
    {
      id: "chapter8",
      title: "Documentation and Court Requirements",
      description: "Essential documentation for effective mediation",
      completed: false,
      sections: [
        { id: "c8s1", title: "Mediation Documentation", completed: false, duration: "8 min read" },
        { id: "c8s2", title: "Mediated Agreement Drafting", completed: false, duration: "10 min read" },
        { id: "c8s3", title: "Court Interaction", completed: false, duration: "9 min read" },
      ]
    },
    {
      id: "chapter9",
      title: "Building Your Family Mediation Practice",
      description: "Establishing and growing a successful mediation service",
      completed: false,
      sections: [
        { id: "c9s1", title: "Practice Development", completed: false, duration: "9 min read" },
        { id: "c9s2", title: "Marketing and Client Acquisition", completed: false, duration: "8 min read" },
        { id: "c9s3", title: "Professional Development", completed: false, duration: "7 min read" },
      ]
    },
    {
      id: "chapter10",
      title: "Resources and Continuing Education",
      description: "Ongoing learning and professional development",
      completed: false,
      sections: [
        { id: "c10s1", title: "Professional Resources", completed: false, duration: "6 min read" },
        { id: "c10s2", title: "Training Opportunities", completed: false, duration: "7 min read" },
        { id: "c10s3", title: "Community of Practice", completed: false, duration: "5 min read" },
      ]
    }
  ]
};

// Initial content for sections
const initialChapterContent = {
  "c1s1": {
    title: "What is Family Mediation in Ireland?",
    content: "Family mediation in Ireland is a voluntary process where separating or divorcing couples work with a qualified mediator to reach agreements on matters such as child custody, financial support, and property division. The process provides an alternative to adversarial court proceedings, allowing couples to maintain control over decisions affecting their family's future while adhering to Irish family law requirements."
  },
  "c1s2": {
    title: "The Irish Context",
    content: "The Mediation Act 2017 formalised mediation practices in Ireland, encouraging parties to consider mediation before proceeding to court. In family law cases, solicitors are required to provide information about mediation services to clients contemplating separation or divorce proceedings."
  },
  "c1s3": {
    title: "Benefits of Family Mediation in Ireland",
    content: "Family mediation offers significant advantages for separating couples in Ireland:\n\n• Cost-Effective: Substantially less expensive than contested court proceedings\n• Time-Efficient: Can achieve resolution in weeks or months rather than years\n• Confidential: Discussions remain private, protecting family privacy\n• Child-Centred: Focuses on arrangements that prioritise children's wellbeing\n• Relationship Preservation: Maintains cooperative communication between parties\n• Compliance: Agreements reached through mediation typically have higher compliance rates"
  },
  "c2s1": {
    title: "The Mediation Act 2017",
    content: "The Mediation Act 2017 provides the legislative foundation for mediation practice in Ireland. As a mediator, you should thoroughly understand this legislation, including provisions related to:\n\n• Confidentiality of the mediation process\n• Enforceability of mediation agreements\n• The mediator's role and obligations\n• Relationship between mediation and court proceedings"
  },
  "c2s2": {
    title: "Professional Standards and Accreditation",
    content: "Family mediators in Ireland should pursue accreditation through recognised bodies such as the Mediators' Institute of Ireland (MII). Understanding the standards, ethics, and continuing professional development requirements is essential for establishing a credible practice."
  },
  "c2s3": {
    title: "Family Law in Ireland",
    content: "Familiarise yourself with relevant legislation including:\n\n• Family Law (Divorce) Act 1996\n• Family Law (Separation and Maintenance) Act 1976\n• Children and Family Relationships Act 2015\n• Domestic Violence Act 2018\n\nUnderstanding these legal frameworks is crucial when mediating family disputes within the Irish context."
  }
};

const GuidesAdminGettingStarted = () => {
  const isMobile = useIsMobile();
  const [guideContent, setGuideContent] = useState(initialGuideContent);
  const [chapterContent, setChapterContent] = useState(initialChapterContent);
  const [activeTab, setActiveTab] = useState("structure");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [editGuideInfo, setEditGuideInfo] = useState(false);
  const [changesUnsaved, setChangesUnsaved] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'chapter' | 'section'} | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState<string | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDesc, setNewChapterDesc] = useState("");

  useEffect(() => {
    // This would typically fetch the guide data from an API
    // For demo, we're using static data
  }, []);

  // Save changes to a section's content
  const handleSaveContent = () => {
    if (!editingSection) return;

    const updatedContent = {
      ...chapterContent,
      [editingSection]: {
        ...chapterContent[editingSection],
        title: currentTitle,
        content: currentContent
      }
    };

    setChapterContent(updatedContent);
    setEditingSection(null);
    setChangesUnsaved(false);
  };

  // Cancel editing and discard changes
  const handleCancelEdit = () => {
    setEditingSection(null);
    setCurrentContent("");
    setCurrentTitle("");
    setChangesUnsaved(false);
  };

  // Open editor for a section
  const handleEditSection = (sectionId: string) => {
    const section = chapterContent[sectionId];
    if (section) {
      setEditingSection(sectionId);
      setCurrentContent(section.content);
      setCurrentTitle(section.title);
    }
  };

  // Handle content changes in the editor
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentContent(e.target.value);
    setChangesUnsaved(true);
  };

  // Handle title changes in the editor
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
    setChangesUnsaved(true);
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Delete chapter or section
  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'chapter') {
      // Remove chapter and all its sections
      const updatedGuideContent = {
        ...guideContent,
        chapters: guideContent.chapters.filter(chapter => chapter.id !== itemToDelete.id)
      };
      setGuideContent(updatedGuideContent);
    } else {
      // Find chapter containing this section
      const parentChapter = guideContent.chapters.find(chapter => 
        chapter.sections.some(section => section.id === itemToDelete.id)
      );
      
      if (parentChapter) {
        // Update chapter's sections
        const updatedChapters = guideContent.chapters.map(chapter => {
          if (chapter.id === parentChapter.id) {
            return {
              ...chapter,
              sections: chapter.sections.filter(section => section.id !== itemToDelete.id)
            };
          }
          return chapter;
        });
        
        setGuideContent({...guideContent, chapters: updatedChapters});
        
        // Also remove content for this section
        const updatedContent = {...chapterContent};
        delete updatedContent[itemToDelete.id];
        setChapterContent(updatedContent);
      }
    }
    
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  // Add new section to a chapter
  const handleAddSection = (chapterId: string) => {
    const parentChapter = guideContent.chapters.find(chapter => chapter.id === chapterId);
    if (!parentChapter) return;
    
    const newSectionId = `${chapterId}s${parentChapter.sections.length + 1}`;
    const newSection = {
      id: newSectionId,
      title: "New Section",
      completed: false,
      duration: "5 min read"
    };
    
    // Add to chapter
    const updatedChapters = guideContent.chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          sections: [...chapter.sections, newSection]
        };
      }
      return chapter;
    });
    
    // Add content for new section
    const updatedContent = {
      ...chapterContent,
      [newSectionId]: {
        title: "New Section",
        content: "Enter content for this new section here."
      }
    };
    
    setGuideContent({...guideContent, chapters: updatedChapters});
    setChapterContent(updatedContent);
    
    // Auto edit the new section
    setTimeout(() => {
      handleEditSection(newSectionId);
    }, 100);
  };

  // Add new chapter
  const handleAddChapter = () => {
    const newChapterId = `chapter${guideContent.chapters.length + 1}`;
    const newChapter = {
      id: newChapterId,
      title: "New Chapter",
      description: "Enter description for this chapter",
      completed: false,
      sections: []
    };
    
    setGuideContent({
      ...guideContent,
      chapters: [...guideContent.chapters, newChapter]
    });
    
    // Expand the new chapter
    setActiveChapter(newChapterId);
    
    // Start editing chapter title
    setEditingChapterTitle(newChapterId);
    setNewChapterTitle("New Chapter");
    setNewChapterDesc("Enter description for this chapter");
  };

  // Save chapter title edit
  const handleSaveChapterTitle = () => {
    if (!editingChapterTitle) return;
    
    const updatedChapters = guideContent.chapters.map(chapter => {
      if (chapter.id === editingChapterTitle) {
        return {
          ...chapter,
          title: newChapterTitle,
          description: newChapterDesc
        };
      }
      return chapter;
    });
    
    setGuideContent({...guideContent, chapters: updatedChapters});
    setEditingChapterTitle(null);
  };

  // Move section up or down
  const handleMoveSection = (chapterId: string, sectionId: string, direction: 'up' | 'down') => {
    const chapter = guideContent.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    const sectionIndex = chapter.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    
    // Can't move first item up or last item down
    if ((direction === 'up' && sectionIndex === 0) || 
        (direction === 'down' && sectionIndex === chapter.sections.length - 1)) {
      return;
    }
    
    const newSections = [...chapter.sections];
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    
    // Swap positions
    [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];
    
    const updatedChapters = guideContent.chapters.map(c => {
      if (c.id === chapterId) {
        return {...c, sections: newSections};
      }
      return c;
    });
    
    setGuideContent({...guideContent, chapters: updatedChapters});
  };

  // Move chapter up or down
  const handleMoveChapter = (chapterId: string, direction: 'up' | 'down') => {
    const chapterIndex = guideContent.chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) return;
    
    // Can't move first item up or last item down
    if ((direction === 'up' && chapterIndex === 0) || 
        (direction === 'down' && chapterIndex === guideContent.chapters.length - 1)) {
      return;
    }
    
    const newChapters = [...guideContent.chapters];
    const targetIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
    
    // Swap positions
    [newChapters[chapterIndex], newChapters[targetIndex]] = [newChapters[targetIndex], newChapters[chapterIndex]];
    
    setGuideContent({...guideContent, chapters: newChapters});
  };

  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  // Render editor UI
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/admin/content/guides">
              <ChevronLeft className={iconSizeClass} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Guide</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {guideContent.title}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline">
            <Eye className={`${iconSizeClass} mr-1.5`} />
            Preview
          </Button>
          <Button>
            <Save className={`${iconSizeClass} mr-1.5`} />
            Publish Changes
          </Button>
        </div>
      </div>

      {/* Edit Guide Tabs */}
      <Tabs defaultValue="structure" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
        </TabsList>

        {/* Tab content for guide structure */}
        <TabsContent value="structure" className="space-y-4 mt-4">
          {/* Basic guide information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Guide Information</CardTitle>
                <CardDescription>Basic guide details and metadata</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditGuideInfo(true)}>
                <Edit className={`${iconSizeClass} mr-1.5`} />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <h3 className="font-medium text-sm">Title</h3>
                <p>{guideContent.title}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm">Description</h3>
                <p className="text-sm text-muted-foreground">{guideContent.description}</p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center">
                  <Badge variant="outline">{guideContent.chapters.length} Chapters</Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline">
                    {guideContent.chapters.reduce((acc, chapter) => acc + chapter.sections.length, 0)} Sections
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Published</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapters and Sections Editor */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Chapters and Sections</h2>
              <Button onClick={handleAddChapter}>
                <Plus className={`${iconSizeClass} mr-1.5`} />
                Add Chapter
              </Button>
            </div>
            
            {/* Chapters accordion */}
            <Accordion
              type="multiple"
              className="w-full"
              value={activeChapter ? [activeChapter] : []}
            >
              {guideContent.chapters.map((chapter) => (
                <AccordionItem
                  key={chapter.id}
                  value={chapter.id}
                  className={chapter.completed ? "border-l-4 border-l-green-500" : ""}
                >
                  <AccordionTrigger
                    className="px-4 hover:no-underline hover:bg-muted/30"
                    onClick={() => setActiveChapter(activeChapter === chapter.id ? null : chapter.id)}
                  >
                    <div className="flex w-full justify-between items-center">
                      <div className="flex items-center">
                        {editingChapterTitle === chapter.id ? (
                          <Input
                            value={newChapterTitle}
                            onChange={(e) => setNewChapterTitle(e.target.value)}
                            className="max-w-sm"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveChapterTitle()}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>{chapter.title}</span>
                        )}
                        {chapter.completed && !editingChapterTitle && (
                          <BookmarkCheck className={`${iconSizeClass} text-green-500 ml-2`} />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {editingChapterTitle === chapter.id ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveChapterTitle();
                              }}
                            >
                              <Save className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChapterTitle(null);
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {chapter.completed ? (
                              <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
                            ) : (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveChapter(chapter.id, 'up');
                              }}
                              disabled={guideContent.chapters.indexOf(chapter) === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveChapter(chapter.id, 'down');
                              }}
                              disabled={guideContent.chapters.indexOf(chapter) === guideContent.chapters.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChapterTitle(chapter.id);
                                setNewChapterTitle(chapter.title);
                                setNewChapterDesc(chapter.description);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete({id: chapter.id, type: 'chapter'});
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-3">
                    {editingChapterTitle === chapter.id ? (
                      <Textarea
                        value={newChapterDesc}
                        onChange={(e) => setNewChapterDesc(e.target.value)}
                        className="mb-3"
                        placeholder="Chapter description"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <CardDescription className="mb-3">{chapter.description}</CardDescription>
                    )}
                    
                    <div className="space-y-3">
                      {chapter.sections.map((section) => (
                        <div key={section.id} className="border rounded-md overflow-hidden">
                          {editingSection === section.id ? (
                            <div className="p-4 space-y-3">
                              <div>
                                <label htmlFor="section-title" className="block text-sm font-medium mb-1">
                                  Section Title
                                </label>
                                <Input
                                  id="section-title"
                                  value={currentTitle}
                                  onChange={handleTitleChange}
                                  className="w-full"
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="section-content" className="block text-sm font-medium mb-1">
                                  Content
                                </label>
                                <Textarea
                                  id="section-content"
                                  value={currentContent}
                                  onChange={handleContentChange}
                                  className="w-full min-h-[200px]"
                                />
                              </div>
                              
                              <div className="flex justify-between pt-3">
                                <Button variant="outline" onClick={handleCancelEdit}>
                                  Cancel
                                </Button>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="default" 
                                    onClick={handleSaveContent}
                                    disabled={!changesUnsaved}
                                  >
                                    <Save className={`${iconSizeClass} mr-1.5`} />
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div
                                className={`flex items-center justify-between p-3 ${
                                  isMobile ? "text-sm" : ""
                                } cursor-pointer hover:bg-muted/30`}
                                onClick={() => toggleSection(section.id)}
                              >
                                <div className="flex items-center space-x-2">
                                  {section.completed ? (
                                    <CircleCheck className={`${iconSizeClass} text-green-500`} />
                                  ) : (
                                    <CircleDashed className={iconSizeClass} />
                                  )}
                                  <span
                                    className={
                                      section.completed ? "text-muted-foreground" : ""
                                    }
                                  >
                                    {section.title}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span
                                    className={`${
                                      isMobile ? "text-xs" : "text-sm"
                                    } text-muted-foreground mr-2`}
                                  >
                                    {section.duration}
                                  </span>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveSection(chapter.id, section.id, 'up');
                                    }}
                                    disabled={chapter.sections.indexOf(section) === 0}
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveSection(chapter.id, section.id, 'down');
                                    }}
                                    disabled={chapter.sections.indexOf(section) === chapter.sections.length - 1}
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSection(section.id);
                                    }}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setItemToDelete({id: section.id, type: 'section'});
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                  
                                  {expandedSections[section.id] ? (
                                    <ChevronUp className={iconSizeClass} />
                                  ) : (
                                    <ChevronDown className={iconSizeClass} />
                                  )}
                                </div>
                              </div>

                              {/* Preview section content */}
                              {expandedSections[section.id] && (
                                <div>
                                  <Separator />
                                  <div className={`${isMobile ? "p-3" : "p-5"} prose max-w-none bg-muted/10`}>
                                    {chapterContent[section.id]?.content.split('\n\n').map((paragraph, idx) => (
                                      <p key={idx} className="mb-4">
                                        {paragraph}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Add section button */}
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => handleAddSection(chapter.id)}
                        className="w-full"
                      >
                        <Plus className={`${iconSizeClass} mr-1.5`} />
                        Add Section
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Empty state if no chapters */}
            {guideContent.chapters.length === 0 && (
              <Card className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium">No chapters added yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Start by adding your first chapter to the guide
                </p>
                <Button onClick={handleAddChapter}>
                  <Plus className={`${iconSizeClass} mr-1.5`} />
                  Add First Chapter
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          {/* Guide settings would go here - timing estimates, category, etc. */}
          <Card>
            <CardHeader>
              <CardTitle>Guide Settings</CardTitle>
              <CardDescription>Configure guide settings and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="guide-category" className="block text-sm font-medium">
                  Category
                </label>
                <Select defaultValue="onboarding">
                  <SelectTrigger id="guide-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="how-to">How-to</SelectItem>
                    <SelectItem value="best-practices">Best Practices</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="guide-estimated-time" className="block text-sm font-medium">
                  Estimated Reading Time
                </label>
                <div className="flex gap-2">
                  <Input type="number" id="guide-estimated-time" defaultValue={30} className="w-24" />
                  <span className="self-center">minutes</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The approximate time it takes to complete this guide
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="guide-completion" className="block text-sm font-medium">
                  Completion Settings
                </label>
                <div className="flex gap-2 items-center">
                  <Checkbox id="require-all-sections" />
                  <label htmlFor="require-all-sections" className="text-sm">
                    Require all sections to be viewed for completion
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-4 mt-4">
          {/* Visibility settings - publish status, access controls, etc. */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility & Access</CardTitle>
              <CardDescription>Control who can access this guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="guide-status" className="block text-sm font-medium">
                  Publication Status
                </label>
                <Select defaultValue="published">
                  <SelectTrigger id="guide-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="guide-visibility" className="block text-sm font-medium">
                  Visibility
                </label>
                <Select defaultValue="all">
                  <SelectTrigger id="guide-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="registered">Registered Users</SelectItem>
                    <SelectItem value="subscribers">Subscribers Only</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Controls which user groups can access this guide
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Schedule Publication</h3>
                <div className="flex gap-2 items-center">
                  <Checkbox id="schedule-publish" />
                  <label htmlFor="schedule-publish" className="text-sm">
                    Schedule publication date
                  </label>
                </div>
                <div className="flex gap-2 mt-2">
                  <Input type="date" className="w-full" />
                  <Input type="time" className="w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Guide Information Dialog */}
      <Dialog open={editGuideInfo} onOpenChange={setEditGuideInfo}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Guide Information</DialogTitle>
            <DialogDescription>
              Update the basic information for this guide.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="guide-title" className="block text-sm font-medium">
                Guide Title
              </label>
              <Input 
                id="guide-title" 
                value={guideContent.title} 
                onChange={(e) => setGuideContent({...guideContent, title: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="guide-description" className="block text-sm font-medium">
                Description
              </label>
              <Textarea 
                id="guide-description" 
                value={guideContent.description} 
                onChange={(e) => setGuideContent({...guideContent, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGuideInfo(false)}>
              Cancel
            </Button>
            <Button onClick={() => setEditGuideInfo(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {itemToDelete?.type === 'chapter' ? 'Delete Chapter' : 'Delete Section'}
            </DialogTitle>
            <DialogDescription>
              {itemToDelete?.type === 'chapter'
                ? "This will delete the entire chapter and all its sections. This action cannot be undone."
                : "This will delete this section and its content. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuidesAdminGettingStarted;