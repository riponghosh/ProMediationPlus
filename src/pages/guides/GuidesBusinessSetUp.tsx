import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, BookOpen, BookmarkCheck, CircleCheck, CircleDashed, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Mock data for guide chapters and sections
const guideContent = {
  title: "Business Set Up Guide",
  description: "A comprehensive guide to setting up your mediation business, from legal requirements to marketing.",
  chaptersCount: 5,
  completedChapters: 0,
  totalSections: 15, // Updated: 5 chapters * 3 sections
  completedSections: 0,
  chapters: [
    {
      id: "chapter1_define_service",
      title: "Clearly Define Your Service Offering",
      description: "Guidance on defining your mediation services and specialisation.",
      completed: false,
      sections: [
        { id: "c1s1", title: "Understanding Your Core Offer", completed: false, duration: "3 min read" },
        { id: "c1s2", title: "Exploring Specialisation Areas", completed: false, duration: "3 min read" },
        { id: "c1s3", title: "Benefits of Niche Marketing", completed: false, duration: "2 min read" },
      ]
    },
    {
      id: "chapter2_skills_qualifications",
      title: "Acquire the Necessary Skills and Qualifications",
      description: "Information on essential training, accreditation, and professional development.",
      completed: false,
      sections: [
        { id: "c2s1", title: "Importance of Mediation Training", completed: false, duration: "4 min read" },
        { id: "c2s2", title: "Professional Memberships & Accreditation", completed: false, duration: "3 min read" },
        { id: "c2s3", title: "Commitment to CPD", completed: false, duration: "3 min read" },
      ]
    },
    {
      id: "chapter3_practicalities",
      title: "Address the Essential Practicalities",
      description: "Covers setting up your office space, whether physical or virtual.",
      completed: false,
      sections: [
        { id: "c3s1", title: "Planning Your Office Space", completed: false, duration: "2 min read" },
        { id: "c3s2", title: "Physical vs. Virtual Office", completed: false, duration: "2 min read" },
        { id: "c3s3", title: "Considerations for Online Mediation", completed: false, duration: "2 min read" },
      ]
    },
    {
      id: "chapter4_finances",
      title: "Organising Finances",
      description: "Details on business bank accounts and necessary insurance.",
      completed: false,
      sections: [
        { id: "c4s1", title: "Setting Up a Business Bank Account", completed: false, duration: "2 min read" },
        { id: "c4s2", title: "Essential: Professional Indemnity Insurance", completed: false, duration: "2 min read" },
        { id: "c4s3", title: "Public Liability Insurance Needs", completed: false, duration: "2 min read" },
      ]
    },
    {
      id: "chapter5_branding_marketing",
      title: "Branding and Marketing",
      description: "Tips for creating your brand and marketing materials, including a website.",
      completed: false,
      sections: [
        { id: "c5s1", title: "Developing Your Brand Identity", completed: false, duration: "3 min read" },
        { id: "c5s2", title: "Creating a Professional Website", completed: false, duration: "2 min read" },
        { id: "c5s3", title: "Foundation for Client Acquisition", completed: false, duration: "2 min read" },
      ]
    }
  ]
};

// Chapter content for display when a section is selected
const chapterContent: Record<string, { title: string; content: string }> = {
  "c1s1": {
    title: "Understanding Your Core Offer",
    content: "Before you can effectively market your services, you must have absolute clarity on precisely what you offer. While your practice may evolve over time, a well-defined initial service offering is crucial for instilling client confidence and differentiating yourself."
  },
  "c1s2": {
    title: "Exploring Specialisation Areas",
    content: "Whilst offering general mediation services is an option, specialising can significantly help you stand out in a growing market. Consider focusing on areas where you have particular expertise or a strong interest. Common areas of specialisation include:\n\n * Family Mediation: Assisting separating or divorcing couples with issues such as child arrangements, property division, and financial matters. This often requires specific training and accreditation.\n * Workplace Mediation: Facilitating resolution of disputes between colleagues, managers and staff, or teams within an organisation. This can encompass a wide range of issues from communication breakdowns to bullying allegations.\n * Commercial Mediation: Helping businesses resolve contractual disputes, partnership disagreements, or other commercial conflicts, often as an alternative to costly litigation.\n * Community Mediation: Working with individuals to resolve disputes within their communities, such as neighbour disagreements or issues between landlords and tenants."
  },
  "c1s3": {
    title: "Benefits of Niche Marketing",
    content: "Defining your niche allows you to target your marketing more effectively and build a reputation as an expert in that specific area."
  },
  "c2s1": {
    title: "Importance of Mediation Training",
    content: "Becoming a competent and credible mediator requires rigorous training and a commitment to ongoing professional development.\n * Mediation Training: Completing a comprehensive, recognised mediation training course is not just beneficial, it\'s typically essential for professional practice and often a prerequisite for accreditation. In Ireland, look for courses accredited by reputable organisations such as the Mediators\' Institute of Ireland (MII) or the Irish Professional Mediators\' Organisation (IPMO). In the UK, key accrediting bodies include the Civil Mediation Council (CMC) for civil and commercial mediation and the Family Mediation Council (FMC) for family mediation. The Law Society of Ireland and the Bar of Ireland also play a role in training and endorsing mediators, particularly within the legal profession. These accredited courses ensure you meet the necessary standards of competence and ethical practice."
  },
  "c2s2": {
    title: "Professional Memberships & Accreditation",
    content: " * Membership in Recognised Organisations: Joining professional bodies like the MII or IPMO in Ireland, or the CMC or FMC in the UK, offers more than just a badge of honour. Membership provides access to ongoing training, supervision, networking opportunities, and adherence to a professional code of conduct, all of which are vital for your development and credibility."
  },
  "c2s3": {
    title: "Commitment to CPD",
    content: " * Continuous Professional Development (CPD): Mediation is a dynamic field. Legislation, best practices, and the nuances of conflict resolution evolve. Plan for regular CPD activities to keep your skills sharp and your knowledge current. This might include advanced training in specific mediation models, attending workshops, engaging in peer supervision, or undertaking relevant reading and research. Most professional bodies mandate a certain number of CPD hours annually for continued membership and accreditation."
  },
  "c3s1": {
    title: "Planning Your Office Space",
    content: "Setting up the operational side of your business requires careful planning and attention to detail.\n\n * Office Space: Decide on your business location."
  },
  "c3s2": {
    title: "Physical vs. Virtual Office",
    content: "While a traditional physical office provides a dedicated, neutral space for face-to-face sessions and can project an image of established professionalism, it also incurs significant costs. Consider the accessibility and privacy of any physical location.\n   Alternatively, particularly for certain types of mediation, operating primarily online is increasingly viable."
  },
  "c3s3": {
    title: "Considerations for Online Mediation",
    content: "This requires a reliable and secure video conferencing platform (such as Zoom, Microsoft Teams, or similar platforms with robust security and breakout room features). Ensure you have a professional and confidential space from which to conduct virtual sessions, free from interruptions and with a neutral background. Hybrid models, using rented sessional rooms when needed, offer flexibility."
  },
  "c4s1": {
    title: "Setting Up a Business Bank Account",
    content: " * Business Bank Account: It is crucial to separate your business finances from your personal accounts. Open a dedicated business bank account. This simplifies accounting, makes tracking income and expenses easier, and is necessary for tax purposes. Research different banks to find one that offers suitable services and fees for a small business or sole trader."
  },
  "c4s2": {
    title: "Essential: Professional Indemnity Insurance",
    content: " * Insurance: Obtaining the necessary business insurance is non-negotiable to protect yourself and your practice.\n   * Professional Indemnity Insurance: Also known as errors and omissions insurance, this is vital for mediators. It covers legal costs and compensation if a client alleges that your professional advice or services were negligent or caused them financial loss. This is a mandatory requirement for membership of many professional mediation bodies in both Ireland and the UK."
  },
  "c4s3": {
    title: "Public Liability Insurance Needs",
    content: "   * Public Liability Insurance: If you have a physical office where clients visit, or if you meet clients in other locations, public liability insurance provides cover if a client or member of the public suffers injury or property damage as a result of your business activities."
  },
  "c5s1": {
    title: "Developing Your Brand Identity",
    content: " * Develop Your Branding and Marketing Materials: Establishing a professional brand identity from the outset is important.\n   * Logo and Branding: Create a professional logo and consistent branding elements (colours, fonts) that reflect the values and nature of your mediation service. This helps with recognition and creating a professional image."
  },
  "c5s2": {
    title: "Creating a Professional Website",
    content: "   * Website: A professional website is no longer optional; it\'s essential. It serves as your primary online presence, providing potential clients with information about your services, your expertise, your contact details, and explaining the mediation process. Ensure it is well-designed, easy to navigate, and mobile-friendly."
  },
  "c5s3": {
    title: "Foundation for Client Acquisition",
    content: "By meticulously addressing these business set-up essentials, you create a solid and professional foundation for your mediation practice, enabling you to focus on providing high-quality services to your clients and building a sustainable business."
  }
};

const GuidesBusinessSetUp = () => {
  const isMobile = useIsMobile();
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<number>(0);
  // State to hold the dynamic guide content, initialized with mock data
  // This allows us to update completion status locally
  const [currentGuideContent, setCurrentGuideContent] = useState(JSON.parse(JSON.stringify(guideContent)));

  useEffect(() => {
    // Calculate progress based on completed sections from the stateful currentGuideContent
    const totalProgress = (currentGuideContent.completedSections / currentGuideContent.totalSections) * 100;
    setProgress(totalProgress);
  }, [currentGuideContent.completedSections, currentGuideContent.totalSections]);

  const markCompleted = (sectionId: string) => {
    console.log(`Marked ${sectionId} as completed`);
    setCurrentGuideContent(prevGuideContent => {
      const updatedChapters = prevGuideContent.chapters.map(chapter => ({
        ...chapter,
        sections: chapter.sections.map(section =>
          section.id === sectionId ? { ...section, completed: true } : section
        ),
      }));

      let completedSectionsCount = 0;
      updatedChapters.forEach(chapter => {
        chapter.sections.forEach(section => {
          if (section.completed) completedSectionsCount++;
        });
        chapter.completed = chapter.sections.every(s => s.completed);
      });
      const completedChaptersCount = updatedChapters.filter(c => c.completed).length;

      return {
        ...prevGuideContent,
        chapters: updatedChapters,
        completedSections: completedSectionsCount,
        completedChapters: completedChaptersCount,
      };
    });
    setExpandedSections(prev => ({ ...prev, [sectionId]: false }));
  };

  const markChapterCompleted = (chapterId: string) => {
    console.log(`Marked entire chapter ${chapterId} as completed`);
    setCurrentGuideContent(prevGuideContent => {
      const updatedChapters = prevGuideContent.chapters.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            completed: true,
            sections: chapter.sections.map(section => ({ ...section, completed: true })),
          };
        }
        return chapter;
      });

      let completedSectionsCount = 0;
      updatedChapters.forEach(chapter => {
        chapter.sections.forEach(section => {
          if (section.completed) completedSectionsCount++;
        });
      });
      const completedChaptersCount = updatedChapters.filter(c => c.completed).length;

      return {
        ...prevGuideContent,
        chapters: updatedChapters,
        completedSections: completedSectionsCount,
        completedChapters: completedChaptersCount,
      };
    });
    setActiveChapter(null); // Collapse the chapter
  };

  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <Layout>
      <div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} p-4 md:p-6`}>
        
        {/* Header with back button (TITLE SECTION) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/guides">
                <ChevronLeft className={iconSizeClass} />
              </Link>
            </Button>
            <div>
              <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Guides</h1>
              <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                {guideContent.title}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`${isMobile ? "py-1 px-2 text-xs" : "py-1.5 px-3"}`}>
            Learning Course
          </Badge>
        </div>

        {/* Video Intro Section with Text Side Card (VIDEO SECTION) */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Video Player Card */}
          <div className="md:flex-grow-[2] md:w-0"> {/* Video takes ~2/3 width on md+ */}
            <Card className="overflow-hidden h-full">
              <CardContent className="p-0 aspect-video bg-black"> {/* bg-black for letterboxing if needed */}
                <video
                  controls
                  preload="metadata"
                  className="w-full h-full object-contain" /* object-contain to show full video */
                >
                  <source src="/videos/pmp guide to mediation intro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </CardContent>
            </Card>
          </div>

          {/* Text Side Card */}
          <div className="md:flex-grow-[1] md:w-0"> {/* Text card takes ~1/3 width on md+ */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Video Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  This introductory video outlines the core concepts of the "Mediate for Success" guide. 
                  It highlights key strategies and principles that will be explored in detail throughout the chapters, 
                  aiming to equip you with the knowledge to enhance your mediation practice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Bar (PROGRESS BAR SECTION) */}
        <Card>
          <CardHeader className={`${isMobile ? "p-4 pb-2" : "pb-4"}`}>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className={`flex items-center ${isMobile ? "text-base" : ""}`}>
                <BookOpen className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} mr-2 text-primary`} />
                Your Progress
              </CardTitle>
              <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}>
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <CardDescription className="mt-2 flex justify-between text-xs md:text-sm">
              <span>{guideContent.completedChapters} of {guideContent.chaptersCount} chapters completed</span>
              <span>{guideContent.completedSections} of {guideContent.totalSections} sections completed</span>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Separator */}
        <Separator className={isMobile ? "my-1.5" : ""} />

        {/* Chapter list with expandable sections (MAIN CONTENT) */}
        <div className="space-y-4 mt-2">
          <Accordion type="multiple" className="w-full" value={activeChapter ? [activeChapter] : []} onValueChange={(value) => setActiveChapter(value[0] || null)}>
            {guideContent.chapters.map(chapter => (
              <AccordionItem
                key={chapter.id}
                value={chapter.id}
                className={`rounded-md mb-2 overflow-hidden ${chapter.completed ? "border-l-4 border-green-500 bg-green-500/5" : "border"}`}
              >
                <AccordionTrigger
                  className={`px-4 py-3 hover:no-underline ${activeChapter === chapter.id ? "bg-muted/50" : "hover:bg-muted/30"}`}
                >
                  <div className="flex w-full justify-between items-center">
                    <div className="flex items-center text-left">
                      <span className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>{chapter.title}</span>
                      {chapter.completed && <BookmarkCheck className={`${iconSizeClass} text-green-500 ml-2 flex-shrink-0`} />}
                    </div>
                    {chapter.completed ? (
                      <Badge className="bg-green-500 hover:bg-green-600 ml-2 flex-shrink-0">Completed</Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 flex-shrink-0">In Progress</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 border-t bg-background">
                  <CardDescription className="my-3">{chapter.description}</CardDescription>
                  <div className="space-y-3">
                    {chapter.sections.map(section => (
                      <div key={section.id} className="border rounded-md overflow-hidden">
                        <div
                          className={`flex items-center justify-between p-3 ${isMobile ? "text-sm" : ""
                            } cursor-pointer hover:bg-muted/30 ${expandedSections[section.id] ? "bg-muted/20" : ""}`}
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex items-center space-x-2">
                            {section.completed ? (
                              <CircleCheck className={`${iconSizeClass} text-green-500 flex-shrink-0`} />
                            ) : (
                              <CircleDashed className={`${iconSizeClass} text-muted-foreground flex-shrink-0`} />
                            )}
                            <span className={section.completed ? "text-muted-foreground line-through" : ""}>
                              {section.title}
                            </span>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                            <span className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground mr-3`}>
                              {section.duration}
                            </span>
                            {expandedSections[section.id] ? (
                              <ChevronUp className={iconSizeClass} />
                            ) : (
                              <ChevronDown className={iconSizeClass} />
                            )}
                          </div>
                        </div>

                        {expandedSections[section.id] && (
                          <div>
                            <Separator />
                            <div className={`${isMobile ? "p-3" : "p-5"} prose prose-sm sm:prose max-w-none bg-muted/10`}>
                              {(chapterContent[section.id]?.content || "Content not available.")
                                .split('\\n\\n')
                                .map((paragraph, idx) => (
                                  paragraph.startsWith("• ") ? (
                                    <ul key={idx} className="list-disc pl-5 mb-4">
                                      {paragraph.split('\\n').map((item, itemIdx) => (
                                        <li key={itemIdx}>{item.substring(2)}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p key={idx} className="mb-4">
                                      {paragraph}
                                    </p>
                                  )
                                ))}

                              {!section.completed && (
                                <div className="flex justify-end mt-4">
                                  <Button
                                    onClick={() => markCompleted(section.id)}
                                    size={isMobile ? "sm" : "default"}
                                  >
                                    Mark as Completed
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <span className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                      {chapter.sections.filter(s => s.completed).length} of {chapter.sections.length} sections completed
                    </span>
                    {!chapter.completed && chapter.sections.every(s => s.completed) && (
                       <Button
                        size={isMobile ? "sm" : "default"}
                        onClick={() => markChapterCompleted(chapter.id)}
                      >
                        Complete Chapter
                      </Button>
                    )}
                     {chapter.completed && (
                       <Button
                        size={isMobile ? "sm" : "default"}
                        variant="outline"
                        disabled
                      >
                        Chapter Completed
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Layout>
  );
};

export default GuidesBusinessSetUp;