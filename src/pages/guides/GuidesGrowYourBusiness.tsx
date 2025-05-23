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

// Data for "Growing Your Mediation Business" guide
const guideContent = {
  title: "Growing Your Mediation Business: Strategies for Expansion and Sustainability",
  description: "Establishing a mediation practice is just the beginning. Sustainable growth requires proactive strategies to increase visibility, build a strong reputation, and ensure operational efficiency. This guide outlines key areas to focus on as you expand your mediation business.",
  chaptersCount: 8,
  completedChapters: 0,
  totalSections: 8, // Each chapter has 1 section
  completedSections: 0,
  chapters: [
    {
      id: "chapter1",
      title: "Cultivate a Robust Network and Build Key Relationships",
      description: "Networking is fundamental to growing a professional services business like mediation. It\\'s about building genuine connections, not just collecting business cards.",
      completed: false,
      sections: [
        { id: "c1s1", title: "Cultivate a Robust Network and Build Key Relationships", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter2",
      title: "Implement a Targeted Content Marketing Strategy",
      description: "Content marketing helps you demonstrate your expertise, build trust, and attract your target audience by providing valuable information.",
      completed: false,
      sections: [
        { id: "c2s1", title: "Implement a Targeted Content Marketing Strategy", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter3",
      title: "Deliver Engaging Presentations and Workshops",
      description: "Offering presentations and workshops is an excellent way to raise awareness about mediation and showcase your skills and expertise.",
      completed: false,
      sections: [
        { id: "c3s1", title: "Deliver Engaging Presentations and Workshops", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter4",
      title: "Establish Clear Fees and Payment Procedures",
      description: "Transparency around fees and payment is essential for a professional practice and helps manage client expectations.",
      completed: false,
      sections: [
        { id: "c4s1", title: "Establish Clear Fees and Payment Procedures", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter5",
      title: "Develop Standard Operating Procedures (SOPs)",
      description: "Implementing SOPs brings efficiency, consistency, and professionalism to your practice as it grows.",
      completed: false,
      sections: [
        { id: "c5s1", title: "Develop Standard Operating Procedures (SOPs)", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter6",
      title: "Seek Mentorship and Professional Support",
      description: "Navigating the challenges of growing a business is easier with guidance from experienced professionals.",
      completed: false,
      sections: [
        { id: "c6s1", title: "Seek Mentorship and Professional Support", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter7",
      title: "Continuously Evaluate and Adapt",
      description: "The market and the legal landscape are constantly evolving. Regular evaluation ensures your practice remains relevant and successful.",
      completed: false,
      sections: [
        { id: "c7s1", title: "Continuously Evaluate and Adapt", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter8",
      title: "Understand the Legal and Ethical Landscape in Ireland",
      description: "Operating within the legal and ethical framework is paramount for maintaining credibility and protecting your practice.",
      completed: false,
      sections: [
        { id: "c8s1", title: "Understand the Legal and Ethical Landscape in Ireland", completed: false, duration: "5 min read" },
      ]
    }
  ]
};

// Chapter content for display when a section is selected
const chapterContent: Record<string, { title: string; content: string }> = {
  "c1s1": {
    title: "Cultivate a Robust Network and Build Key Relationships",
    content: "Networking is fundamental to growing a professional services business like mediation. It\\'s about building genuine connections, not just collecting business cards.\\n\\n• Join Professional Organisations: Becoming a member of relevant professional bodies, such as the Mediators\\' Institute of Ireland (MII) or the Irish Professional Mediators\\' Organisation (IPMO), is crucial. These organisations offer networking events, training, resources, and opportunities to connect with peers and potential referral sources. Active participation can enhance your credibility and visibility within the mediation community.\\n\\n• Connect with Referral Sources: Develop strong relationships with professionals who are likely to encounter individuals or organisations needing mediation services. This includes solicitors (particularly those in family law, employment law, and commercial litigation), HR professionals, employee relations managers, trade unions, community groups, healthcare providers, and other complementary service providers like therapists or financial advisors. Educate them about your specific mediation services and the benefits for their clients or contacts. Consider offering introductory sessions or presentations to these groups."
  },
  "c2s1": {
    title: "Implement a Targeted Content Marketing Strategy",
    content: "Content marketing helps you demonstrate your expertise, build trust, and attract your target audience by providing valuable information.\\n\\n• Create Valuable Content: Regularly produce content that addresses the issues your target clients face and explains how mediation can help. This could include blog posts on common conflict scenarios (maintaining strict confidentiality, of course), articles explaining the mediation process in specific contexts (e.g., workplace disputes, separating couples), informative videos answering frequently asked questions about mediation, or even infographics illustrating the benefits. Sharing insights on conflict resolution skills can also be valuable.\\n\\n• Leverage Your Website and Online Platforms: Publish your content on your professional website, which serves as your central hub. Share it across relevant online platforms like LinkedIn. Consider contributing articles to industry publications or websites that your target audience reads."
  },
  "c3s1": {
    title: "Deliver Engaging Presentations and Workshops",
    content: "Offering presentations and workshops is an excellent way to raise awareness about mediation and showcase your skills and expertise.\\n\\n• Offer Introductory Sessions: Propose delivering talks to potential referral sources (law firms, HR departments, community centres) or directly to potential client groups. Focus on explaining what mediation is, how it works, its benefits, and in which situations it is most effective.\\n\\n• Design Workshops: Develop interactive workshops on specific conflict resolution skills or the mediation process. These can attract participants who may benefit from your services in the future or become referral sources themselves. Tailor the content to the specific needs and interests of the audience."
  },
  "c4s1": {
    title: "Establish Clear Fees and Payment Procedures",
    content: "Transparency around fees and payment is essential for a professional practice and helps manage client expectations.\\n\\n• Determine Your Fee Structure: Research typical fee structures for mediators in Ireland, which commonly include hourly rates, per-session fees, or occasionally flat fees for specific types of mediation. Your fees should reflect your experience, expertise, and the complexity of the cases you handle. Be clear about what is included in your fees (e.g., preparation time, session time, drafting of agreements).\\n\\n• Establish Clear Payment Terms: Outline your payment procedures in your service agreement or contract. Specify when payment is due (e.g., in advance of sessions, upon completion), accepted payment methods, and your policy on cancellations or postponements. Ensure clients understand the fee structure and payment process before commencing mediation."
  },
  "c5s1": {
    title: "Develop Standard Operating Procedures (SOPs)",
    content: "Implementing SOPs brings efficiency, consistency, and professionalism to your practice as it grows.\\n\\n• Create Processes for Key Stages: Document your procedures for client intake (initial contact, screening for suitability), scheduling sessions, managing case files, conducting mediation sessions (including pre-mediation, joint sessions, caucuses), drafting mediated agreements, and post-mediation follow-up.\\n\\n• Ensure Consistency and Quality: SOPs help ensure that every client receives a consistent and high-quality service, regardless of who on your team (if you expand) is handling the case. They also help with training new staff if applicable."
  },
  "c6s1": {
    title: "Seek Mentorship and Professional Support",
    content: "Navigating the challenges of growing a business is easier with guidance from experienced professionals.\\n\\n• Connect with Experienced Mediators: Seek out mentors who have successfully built and grown their own mediation practices. They can offer invaluable advice, share lessons learned, and provide support. Professional organisations like the MII often have mentorship programmes or facilitate connections between members.\\n\\n• Engage in Peer Supervision/Support: Participate in peer supervision or reflective practice groups. Discussing challenging cases and business issues with fellow mediators can provide new perspectives and reinforce best practises."
  },
  "c7s1": {
    title: "Continuously Evaluate and Adapt",
    content: "The market and the legal landscape are constantly evolving. Regular evaluation ensures your practice remains relevant and successful.\\n\\n• Review Business Performance: Periodically review your business plan, marketing activities, financial performance, and client feedback. What is working well? What could be improved? Identify areas where you need to adapt your strategies.\\n\\n• Stay Updated on Legislation and Best Practises: Commit to ongoing professional development. Stay informed about changes in mediation legislation, such as amendments to the Mediation Act 2017, and evolving best practises in the field."
  },
  "c8s1": {
    title: "Understand the Legal and Ethical Landscape in Ireland",
    content: "Operating within the legal and ethical framework is paramount for maintaining credibility and protecting your practice.\\n\\n• Mediation Act 2017: Familiarise yourself thoroughly with this key piece of legislation in Ireland. Understand its provisions regarding the principles of mediation (voluntary, confidential, facilitated), the role of the mediator, the enforceability of mediated settlement agreements, and the obligations it places on legal advisors to advise clients on mediation.\\n\\n• Code of Conduct: Adhere strictly to the ethical guidelines and codes of conduct set forth by relevant professional bodies to which you belong, such as the MII Code of Ethics and Practice and the IPMO Code of Ethics. These codes provide essential guidance on issues like impartiality, confidentiality, conflicts of interest, and professional competence.\\n\\n• Data Protection (GDPR): As a mediator handling sensitive personal information, you have significant obligations under the General Data Protection Regulation (GDPR). \\n\\nUnderstand your responsibilities regarding the lawful collection, processing, storage, and security of client data. Ensure you have appropriate data protection policies and procedures in place, including obtaining explicit consent where necessary and securely managing case files.\\n\\nBy proactively implementing these strategies and remaining committed to professional development and ethical practice, you can effectively grow and sustain a successful mediation business in Ireland."
  }
};

const GuidesGrowYourBusiness = () => {
  const isMobile = useIsMobile();
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<number>(0);
  const [currentGuideContent, setCurrentGuideContent] = useState(guideContent);
  const [selectedSectionContent, setSelectedSectionContent] = useState<{ title: string; content: string } | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(guideContent.chapters[0]?.sections[0]?.id || null);

  useEffect(() => {
    // Calculate progress based on completed sections
    const totalProgress = (guideContent.completedSections / guideContent.totalSections) * 100;
    setProgress(totalProgress);
  }, []);

  useEffect(() => {
    // Logic to load initial section content or handle updates
    if (activeSection && chapterContent[activeSection]) {
      setSelectedSectionContent(chapterContent[activeSection]);
    } else if (guideContent.chapters.length > 0 && guideContent.chapters[0].sections.length > 0) {
      // Fallback to the first section of the first chapter if activeSection is not found
      const firstChapter = guideContent.chapters[0];
      const firstSectionId = firstChapter.sections[0].id;
      if (chapterContent[firstSectionId]) {
        setSelectedSectionContent(chapterContent[firstSectionId]);
        setActiveChapter(firstChapter.id);
        setActiveSection(firstSectionId);
      }
    } else {
        setSelectedSectionContent(null);
    }
  }, [activeSection]);

  const markCompleted = (sectionId: string) => {
    // In a real implementation, this would update a database
    console.log(`Marked ${sectionId} as completed`);
    // Update the local state to reflect changes immediately
    // For now, let's find the chapter and section to update its 'completed' status
    const updatedChapters = guideContent.chapters.map(chapter => ({
      ...chapter,
      sections: chapter.sections.map(section =>
        section.id === sectionId ? { ...section, completed: true } : section
      ),
    }));
    // Recalculate completed sections and chapters
    let completedSectionsCount = 0;
    updatedChapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        if (section.completed) completedSectionsCount++;
      });
      // Check if all sections in a chapter are completed
      chapter.completed = chapter.sections.every(s => s.completed);
    });
    const completedChaptersCount = updatedChapters.filter(c => c.completed).length;

    // Update guideContent (in a real app, this would be managed by state from a store or API)
    guideContent.chapters = updatedChapters;
    guideContent.completedSections = completedSectionsCount;
    guideContent.completedChapters = completedChaptersCount;
    setProgress((completedSectionsCount / guideContent.totalSections) * 100);
    setExpandedSections(prev => ({ ...prev, [sectionId]: false })); // Optionally collapse after marking complete
  };

  const markChapterCompleted = (chapterId: string) => {
    console.log(`Marked entire chapter ${chapterId} as completed`);
    // In a real implementation, this would mark all sections in the chapter as completed
    const updatedChapters = guideContent.chapters.map(chapter => {
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

    guideContent.chapters = updatedChapters;
    guideContent.completedSections = completedSectionsCount;
    guideContent.completedChapters = completedChaptersCount;
    setProgress((completedSectionsCount / guideContent.totalSections) * 100);
    setActiveChapter(null); // Collapse the chapter
  };

  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  // Toggle section visibility
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSectionSelect = (chapterId: string, sectionId: string) => {
    setActiveChapter(chapterId);
    setActiveSection(sectionId);
    setSelectedSectionContent(chapterContent[sectionId]);
  };

  // Placeholder for progress update logic
  const handleMarkComplete = (sectionId: string) => {
    console.log(`Marking section ${sectionId} as complete`);
    // This is where you would update the completion status in currentGuideContent
    // For example, find the chapter and section, mark as complete, update progress counts
    // Then, setCurrentGuideContent with the new state
    // This is a simplified example:
    const newGuideContent = { ...currentGuideContent };
    let updated = false;
    for (const chapter of newGuideContent.chapters) {
      for (const section of chapter.sections) {
        if (section.id === sectionId && !section.completed) {
          section.completed = true;
          newGuideContent.completedSections += 1;
          // Check if chapter is complete
          const chapterSections = newGuideContent.chapters.find(c => c.id === chapter.id)?.sections;
          if (chapterSections?.every(s => s.completed)) {
            chapter.completed = true;
            newGuideContent.completedChapters +=1;
          }
          updated = true;
          break;
        }
      }
      if (updated) break;
    }
    if (updated) {
      setCurrentGuideContent(newGuideContent);
    }
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

export default GuidesGrowYourBusiness;