import React, { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookText, BookOpen, Bookmark, Search, Plus, FileText, Download, ArrowUpRight, FileSignature } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { paths } from "@/routes/paths"; // Import paths

// Mock data for guides
const guides = [
	{
		id: 1,
		title: "Getting Started with Mediation",
		category: "basics",
		description: "Learn the fundamentals of mediation practice and how to prepare for your first case.",
		type: "Guide",
		lastUpdated: "2025-03-10",
		path: paths.guidesGettingStarted // Use paths constant
	},
	{
		id: 2,
		title: "Business Set Up Guide", // Changed title
		category: "techniques", // This can be updated if a new category is more appropriate
		description: "A comprehensive guide to setting up your mediation business, from legal requirements to marketing.", // Changed description
		type: "Guide",
		lastUpdated: "2025-05-22", // Updated lastUpdated date
		path: paths.guidesBusinessSetUp // Use paths constant
	},
	{
		id: 3,
		title: "Growing Your Mediation Business",
		category: "Business Development", // New or existing category
		description: "Strategies for Expansion and Sustainability.",
		type: "Guide", 
		lastUpdated: "2025-05-22", // Today's date
		path: paths.guidesGrowYourBusiness // Use the new path constant
	},
	{
		id: 7,
		title: 'Mediate for Success',
		description: 'A framework for mediation professionals to build a thriving practise.',
		imageUrl: '/static/images/guides/mediate-success.jpg', // Placeholder image
		lastUpdated: 'October 26, 2023',
		path: paths.guidesMediateSuccess, // Use paths constant
		category: 'Professional Development',
		type: "Guide", // Added type property
		readingTime: '45 min',
		author: 'AI Assistant',
	}
];

const GuidesPage = () => {
	const isMobile = useIsMobile();
	const [activeTab, setActiveTab] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");

	// Helper for icon size
	const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

	// Format date in a readable way
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) {
			return "Today";
		} else if (diffInDays === 1) {
			return "Yesterday";
		} else if (diffInDays < 30) {
			return `${diffInDays} days ago`;
		} else {
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}
	};

	// Filter guides based on search term and active tab
	const filteredGuides = guides.filter(guide => {
		const matchesSearch = searchTerm === "" || 
			guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
			guide.description.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesCategory = activeTab === "all" || guide.category === activeTab;
		
		return matchesSearch && matchesCategory;
	});

	// Get badge variant based on guide type
	const getGuideBadge = (type: string) => {
		switch(type) {
			case "Guide":
				return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Guide</Badge>;
			case "Checklist":
				return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Checklist</Badge>;
			case "Handbook":
				return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Handbook</Badge>;
			case "Template":
				return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Template</Badge>;
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

	// Get tab title based on active tab
	const getTabTitle = () => {
		switch(activeTab) {
			case "basics": return "Basic Mediation Guides";
			case "techniques": return "Mediation Techniques";
			case "agreements": return "Agreements"; // Renamed from Specialization
			case "checklists": return "Checklists & Templates";
			case "Business Development": return "Business Development Guides"; // Added for the new category
			default: return "All Guides";
		}
	};

	return (
		<Layout>
			<div className={`flex flex-col ${isMobile ? "space-y-4" : "space-y-6"} p-4 md:p-6`}>
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
					<div>
						<h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Guides & Resources</h1>
						<p className="text-muted-foreground text-sm">
							Mediation reference materials, best practices, and checklists
						</p>
					</div>
					<Button size={isMobile ? "sm" : "default"} className="flex items-center gap-2">
						<Plus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
						Create Guide
					</Button>
				</div>

				{/* Main Content */}
				<Card className="flex flex-col overflow-hidden">
					<CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"} overflow-hidden`}>
						<Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden">
							{/* Tabs navigation */}
							<TabsList className={`
								grid ${isMobile ? "grid-cols-3 md:grid-cols-5" : "grid-cols-5"}
								w-full
								h-auto p-1
								bg-muted rounded-lg
								gap-1
								${!isMobile ? 'md:w-auto md:inline-grid' : ''}
							`}>
								<TabsTrigger 
									value="all" 
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<BookOpen className={iconSizeClass} />
									All
								</TabsTrigger>
								<TabsTrigger 
									value="basics" 
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<BookText className={iconSizeClass} />
									Basics
								</TabsTrigger>
								<TabsTrigger 
									value="techniques" 
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<Bookmark className={iconSizeClass} />
									Techniques
								</TabsTrigger>
								<TabsTrigger 
									value="agreements" 
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<FileText className={iconSizeClass} />
									{isMobile ? "Agreements" : "Agreements"}
								</TabsTrigger>
								<TabsTrigger 
									value="checklists" 
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<FileText className={iconSizeClass} />
									Checklists
								</TabsTrigger>
								{/* Added Business Development Tab */}
								<TabsTrigger 
									value="Business Development" 
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<BookOpen className={iconSizeClass} /> {/* Or a more appropriate icon */}
									Business Dev
								</TabsTrigger>
							</TabsList>

							{/* Title and Search Bar */}
							<div className={`flex flex-col ${isMobile ? "gap-2" : "gap-0"} sm:flex-row sm:justify-between sm:items-center ${isMobile ? "mt-2 mb-1" : "mt-4 mb-2"}`}>
								<CardTitle className={isMobile ? "text-base" : ""}>{getTabTitle()}</CardTitle>
								<div className="relative">
									<Search className={`absolute left-2.5 ${isMobile ? "top-1.5 h-3 w-3" : "top-2.5 h-4 w-4"} text-muted-foreground`} />
									<Input
										placeholder="Search guides..."
										className={`${isMobile ? "text-sm h-8 pl-7" : "pl-8 max-w-xs"}`}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
							</div>

							{/* Tabs Content */}
							{["all", "basics", "techniques", "agreements", "checklists", "Business Development"].map(tabValue => (
								<TabsContent key={tabValue} value={tabValue} className="m-0 pt-0">
									 <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-0 sm:p-4">
										{filteredGuides.length > 0 ? (
											filteredGuides.map((guide) => (
												guide.path ? (
													<Link to={guide.path} key={guide.id}>
														<Card className="overflow-hidden hover:border-primary/50 transition-colors h-full flex flex-col">
															<CardHeader className={`${isMobile ? "p-3" : "p-4"} bg-muted/50`}>
																<div className="flex items-start justify-between">
																	<CardTitle className={`${isMobile ? "text-sm" : "text-base"}`}>{guide.title}</CardTitle>
																	{getGuideBadge(guide.type)}
																</div>
															</CardHeader>
															<CardContent className={`${isMobile ? "p-3" : "p-4"} flex-grow flex flex-col justify-between`}>
																<p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground line-clamp-2 mb-4`}>
																	{guide.description}
																</p>
																<div className="flex items-center justify-between mt-2">
																	<div className="flex items-center text-xs text-muted-foreground">
																		<BookOpen className="mr-1 h-3 w-3" />
																		<span>Updated {formatDate(guide.lastUpdated)}</span>
																	</div>
																	<div className="flex gap-1">
																		<Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.preventDefault(); alert('Download clicked for ' + guide.title); }}>
																			<Download className="h-4 w-4" />
																		</Button>
																		{/* The Link component handles navigation, so this button might be redundant or serve a different purpose like opening in new tab if needed */}
																		<ArrowUpRight className="h-4 w-4 text-muted-foreground self-center" /> 
																	</div>
																</div>
															</CardContent>
														</Card>
													</Link>
												) : (
													<Card key={guide.id} className="overflow-hidden hover:border-primary/50 transition-colors h-full flex flex-col">
														<CardHeader className={`${isMobile ? "p-3" : "p-4"} bg-muted/50`}>
															<div className="flex items-start justify-between">
																<CardTitle className={`${isMobile ? "text-sm" : "text-base"}`}>{guide.title}</CardTitle>
																{getGuideBadge(guide.type)}
															</div>
														</CardHeader>
														<CardContent className={`${isMobile ? "p-3" : "p-4"} flex-grow flex flex-col justify-between`}>
															<p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground line-clamp-2 mb-4`}>
																{guide.description}
															</p>
															<div className="flex items-center justify-between mt-2">
																<div className="flex items-center text-xs text-muted-foreground">
																	<BookOpen className="mr-1 h-3 w-3" />
																	<span>Updated {formatDate(guide.lastUpdated)}</span>
																</div>
																<div className="flex gap-1">
																	<Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => alert('Download clicked for ' + guide.title)}>
																		<Download className="h-4 w-4" />
																	</Button>
																	{/* No path, so no link icon needed, or a disabled one */}
																</div>
															</div>
														</CardContent>
													</Card>
												)
											))
										) : (
											// No results display - only show if no guides
											<div className="col-span-full text-center py-10 text-muted-foreground">
												<BookText className="mx-auto h-10 w-10 mb-2" />
												<h3 className="font-medium">No guides found</h3>
												<p className="text-sm mt-1">
													{searchTerm ? "Try adjusting your search term." : `No guides found in the "${getTabTitle()}" category.`}
												</p>
											</div>
										)}
									</CardContent>
								</TabsContent>
							))}
						</Tabs>
					</CardHeader>
				</Card>

				{/* Featured Resource Section */}
				<div className="pt-2">
					<h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold mb-3`}>Featured Resources</h2>
					<Card className="bg-blue-50 border-blue-100">
						<CardHeader>
							<CardTitle className="flex items-center">
								<BookText className="h-5 w-5 mr-2 text-blue-600" />
								Mediation Fundamentals Training Kit
							</CardTitle>
							<CardDescription>Complete training materials for new mediators, including scripts, exercises, and evaluation forms</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-blue-700">This comprehensive resource includes a step-by-step training program designed to help new mediators develop essential skills.</p>
							<div className="flex gap-2 mt-4">
								<Button className="bg-blue-600 hover:bg-blue-700">
									<Download className="mr-2 h-4 w-4" />
									Download Resources
								</Button>
								<Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100">Learn More</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</Layout>
	);
};

export default GuidesPage;