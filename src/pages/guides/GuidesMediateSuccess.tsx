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

// Data for "Mediate for Success" guide
const guideContent = {
  title: "Mediate for Success",
  description: "Success in the dynamic field of mediation requires a blend of foundational principles and continuous adaptation. This guide offers a framework for mediation professionals to build a thriving practise, drawing on established best practises and current trends.",
  chaptersCount: 8,
  completedChapters: 0,
  totalSections: 8, // Each chapter has 1 section
  completedSections: 0,
  chapters: [
    {
      id: "chapter1",
      title: "Forge Your Professional Identity and Niche",
      description: "Defining your professional vision and specialization.",
      completed: false,
      sections: [
        { id: "c1s1", title: "Forge Your Professional Identity and Niche", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter2",
      title: "Cultivate and Refine Your Core Competencies",
      description: "Ongoing self-assessment and professional development.",
      completed: false,
      sections: [
        { id: "c2s1", title: "Cultivate and Refine Your Core Competencies", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter3",
      title: "Uphold the Highest Professional and Ethical Standards",
      description: "Adhering to codes of conduct and ethical guidelines.",
      completed: false,
      sections: [
        { id: "c3s1", title: "Uphold the Highest Professional and Ethical Standards", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter4",
      title: "Project Professionalism in Every Interaction",
      description: "Maintaining a professional appearance and communication style.",
      completed: false,
      sections: [
        { id: "c4s1", title: "Project Professionalism in Every Interaction", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter5",
      title: "Strategically Leverage Technology for Practise Efficiency",
      description: "Utilizing tools for case management and communication.",
      completed: false,
      sections: [
        { id: "c5s1", title: "Strategically Leverage Technology for Practise Efficiency", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter6",
      title: "Commit to Lifelong Learning and Adaptation",
      description: "Staying updated with advancements in the mediation field.",
      completed: false,
      sections: [
        { id: "c6s1", title: "Commit to Lifelong Learning and Adaptation", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter7",
      title: "Build and Nurture a Professional Network",
      description: "Connecting with peers for support and collaboration.",
      completed: false,
      sections: [
        { id: "c7s1", title: "Build and Nurture a Professional Network", completed: false, duration: "5 min read" },
      ]
    },
    {
      id: "chapter8",
      title: "Champion a Client-Centred and Empathetic Approach",
      description: "Focusing on client needs and fostering open dialogue.",
      completed: false,
      sections: [
        { id: "c8s1", title: "Champion a Client-Centred and Empathetic Approach", completed: false, duration: "5 min read" },
      ]
    }
  ]
};

// Chapter content for display when a section is selected
const chapterContent: Record<string, { title: string; content: string }> = {
  "c1s1": {
    title: "Forge Your Professional Identity and Niche",
    content: "Defining your professional vision is the cornerstone of a successful mediation practise. Consider deeply the areas where your passion and skills intersect with market needs. Will you specialise in the sensitive terrain of family disputes, the complexities of workplace conflicts, or perhaps the intricate details of civil or commercial matters? Clearly identifying your target clientele and the specific services you will offer provides direction for your professional development, marketing efforts, and overall business strategy."
  },
  "c2s1": {
    title: "Cultivate and Refine Your Core Competencies",
    content: "Ongoing self-assessment is not just recommended, it\'s essential. Regularly evaluate your strengths as a mediator and honestly identify areas that require further development. Actively pursue continuous professional development through accredited training programmes, specialised workshops, and relevant seminars. Programmes emphasising collaborative, facilitative, and interest-based approaches, including strategic use of joint sessions and caucuses, remain highly valuable."
  },
  "c3s1": {
    title: "Uphold the Highest Professional and Ethical Standards",
    content: "Mediation is a recognised and often legislated professional service. Presenting yourself as a competent, trustworthy, and ethical practitioner is non-negotiable. Adhere rigorously to established codes of conduct and ethical guidelines relevant to your jurisdiction and any professional bodies you are affiliated with. Maintaining strict confidentiality and unwavering impartiality in all aspects of your work builds trust and upholds the integrity of the mediation process. Regularly review and ensure your practises align with the standards set by relevant professional bodies."
  },
  "c4s1": {
    title: "Project Professionalism in Every Interaction",
    content: "First impressions significantly impact the mediation environment. Your professional appearance and communication style contribute to establishing a neutral and respectful atmosphere. As noted in the original text, dress in a manner that conveys professionalism and neutrality, being mindful of cultural sensitivity and appropriateness for the specific mediation context. In all communications, whether verbal or written, use clear, concise, and respectful language. For formal client interactions and record-keeping, utilising structured professional emails is highly recommended."
  },
  "c5s1": {
    title: "Strategically Leverage Technology for Practise Efficiency",
    content: "Embracing technology is no longer optional but a necessity for a streamlined and effective mediation practise. Utilise specialised tools designed for ADR professionals to manage cases, schedule sessions, and ensure secure communication. Platforms offering features for online dispute resolution, digital document sharing, and secure video conferencing can significantly enhance efficiency, reduce administrative burdens, and improve the client experience like the one you are using now. Pro Mediation Plus."
  },
  "c6s1": {
    title: "Commit to Lifelong Learning and Adaptation",
    content: "The field of mediation is constantly evolving with new research, methodologies, and legal precedents. A commitment to continuous learning is vital to remain effective and relevant. Stay updated with the latest advancements in conflict resolution techniques, legal developments impacting mediation, and best practises in the field. Participate in advanced training programmes that offer opportunities for skill enhancement through interactive learning, simulation, and constructive feedback."
  },
  "c7s1": {
    title: "Build and Nurture a Professional Network",
    content: "Connecting with fellow professionals is invaluable for sharing experiences, gaining insights, seeking mentorship, and collaborating on best practises. Actively engage with professional associations, local mediation groups, and online communities. These networks provide access to resources, potential referral opportunities, and forums for discussing challenges and advancements in the field."
  },
  "c8s1": {
    title: "Champion a Client-Centred and Empathetic Approach",
    content: "At the heart of successful mediation is a genuine commitment to the clients\' needs, perspectives, and goals. Employ active listening techniques to truly understand the underlying interests of all parties. Practise empathy to build rapport and foster a safe space for open dialogue. Recognise the importance of nonverbal cues and strive to create a comfortable and conducive environment that encourages honest communication and collaborative problem-solving.\n\nBy diligently applying these principles and continuously seeking to improve, mediation professionals can enhance their effectiveness, uphold the highest standards of the profession, and make a meaningful difference in helping parties resolve conflict constructively."
  }
};

const GuidesMediateSuccess = () => {
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

export default GuidesMediateSuccess;