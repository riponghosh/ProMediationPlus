import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileOutput, Search, Plus, Clock, Filter, Download, FileText, Files, BookText, FolderClosed, Clipboard, ClipboardList, FileSignature, Briefcase, Users } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { TemplateBuilder } from "@/pages/templates/TemplateBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data for document templates
const allTemplates = [
	{
		id: 1,
		title: "Mediation Agreement",
		category: "mediation", // Updated category
		lastUsed: "2023-06-10T15:30:00",
		description: "Standard agreement outlining mediation process, confidentiality terms, and mediator role.",
		path: "/mediation-template", // Added path for consistency
	},
	{
		id: 7,
		title: "Statement of Means",
		category: "worksheet", // Stays as worksheet, will get default color
		lastUsed: "2023-06-15T16:45:00",
		description: "Financial disclosure form documenting income, expenses, assets, and liabilities of parties.",
		path: "/template-builder", // Changed to generic template builder
	},
	{
		id: 8,
		title: "Parenting Agreement",
		category: "mediation", // Updated category
		lastUsed: "2023-06-20T14:30:00",
		description: "Comprehensive agreement establishing co-parenting arrangements, schedules, and responsibilities for children's welfare.",
		path: "/parenting-template", // Added path
	},
	{
		id: 9,
		title: "Agreement To Mediate",
		category: "mediation", // Updated category
		lastUsed: "2025-06-01T10:00:00",
		description: "Formal agreement signed by parties prior to commencing mediation, outlining the terms and conditions of the mediation process.",
		path: "/mediation-template", // Changed to match existing route
	},
	{
		id: 10,
		title: "Child Maintenance Agreement Template",
		category: "mediation", // Updated category
		lastUsed: "2025-05-28T11:30:00",
		description: "Template for detailing child maintenance payments, schedules, and related terms agreed upon by parents.",
		path: "/template-builder", // Changed to generic template builder
	},
	{
		id: 11,
		title: "Cohabiting Agreement Template",
		category: "mediation", // Updated category
		lastUsed: "2025-05-25T14:15:00",
		description: "Agreement template for unmarried couples living together, outlining property rights, financial responsibilities, and other arrangements.",
		path: "/template-builder", // Changed to generic template builder
	},
	{
		id: 12,
		title: "Client Intake Form",
		category: "intake", // Stays intake
		lastUsed: "2024-07-20T10:00:00",
		description: "Form to collect initial information from a new client.",
		path: "/client-intake-form", // Path was already specific
	},
	// Adding other templates that were previously hardcoded with specific colors
	{
		id: 13, // New ID
		title: "Separation Agreement",
		category: "mediation", // Updated category
		lastUsed: "2025-06-05T10:00:00", // Example date
		description: "Legal agreement template outlining terms for separated couples including property division, support, and other obligations.",
		path: "/separation-template",
	},
	{
		id: 14, // New ID
		title: "Commercial Mediation Agreement",
		category: "commercial", // Updated category
		lastUsed: "2025-06-03T11:00:00", // Example date
		description: "Template for commercial disputes, outlining mediation terms, confidentiality, and party acknowledgements.",
		path: "/commercial-agreement-template",
	},
	{
		id: 15, // New ID
		title: "Organisational & Workplace Agreement",
		category: "workplace", // Updated category
		lastUsed: "2025-06-02T14:00:00", // Example date
		description: "Agreement for resolving workplace and organisational disputes, covering terms, confidentiality, and resolutions.",
		path: "/workplace-agreement-template",
	},
	{
		id: 16, // New ID
		title: "Client Enquiry Form",
		category: "intake", // Stays intake
		lastUsed: "2025-06-01T16:00:00", // Example date
		description: "Form for capturing initial client enquiry details and contact information.",
		path: "/client-enquiry-form",
	},
];

const TemplatesPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const isMobile = useIsMobile();
	const [templateBuilderOpen, setTemplateBuilderOpen] = useState(false);
	const navigate = useNavigate();

	const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return "Today";
		if (diffInDays === 1) return "Yesterday";
		if (diffInDays < 30) return `${diffInDays} days ago`;
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	};

	const getTemplatesForTab = (currentTabValue: string, currentSearchTerm: string) => {
		return allTemplates.filter(template => {
			const matchesSearch = currentSearchTerm === "" ||
				template.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
				template.description.toLowerCase().includes(currentSearchTerm.toLowerCase());
			const matchesCategory = currentTabValue === "all" || template.category === currentTabValue;
			return matchesSearch && matchesCategory;
		});
	};

	// Get tab title based on active tab
	const getTabTitle = () => {
		switch(activeTab) {
			case "mediation": return "Mediation Templates"; // Updated
			case "intake": return "Intake Form Templates";
			case "commercial": return "Commercial Templates"; // Updated
			case "workplace": return "Workplace Templates"; // Updated
			// Removed confidentiality, process, worksheet from specific titles
			default: return "All Templates";
		}
	};

	// Helper function to get card styling based on category
	const getCardStyling = (category: string) => {
		switch (category) {
			case "mediation":
				return {
					card: "border-green-200 bg-green-50/30",
					header: "bg-green-50",
					iconText: "text-green-600",
					iconClass: FileSignature, // Default icon for mediation
				};
			case "intake":
				return {
					card: "border-pink-200 bg-pink-50/30",
					header: "bg-pink-50",
					iconText: "text-pink-600",
					iconClass: ClipboardList,
				};
			case "commercial":
				return {
					card: "border-slate-300 bg-slate-100/50",
					header: "bg-slate-100",
					iconText: "text-slate-600",
					iconClass: FileSignature, // Can be more specific if needed
				};
			case "workplace":
				return {
					card: "border-cyan-200 bg-cyan-50/30",
					header: "bg-cyan-50",
					iconText: "text-cyan-600",
					iconClass: FileSignature, // Can be more specific if needed
				};
			default: // For "worksheet" or any other category
				return {
					card: "border-gray-200 bg-gray-50/30", // Default neutral color
					header: "bg-gray-50",
					iconText: "text-gray-600",
					iconClass: FolderClosed, // Default icon
				};
		}
	};

	return (
		<Layout>
			<div className="flex flex-col w-full max-w-full overflow-hidden">
				{/* Back arrow */}
				<div className="flex items-center mb-2">
					<Button variant="outline" size="icon" asChild>
						<a href="/case-files"> {/* Ensure this link is correct */}
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
						</a>
					</Button>
				</div>

				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
					<div>
						<h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Templates</h1>
						<p className="text-muted-foreground text-sm">
							Document templates for your mediation process
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							size={isMobile ? "sm" : "default"}
							className="flex items-center gap-2"
							onClick={() => setTemplateBuilderOpen(true)}
						>
							<Plus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
							New Template
						</Button>
					</div>
				</div>

				{/* Tabs and Content Section */}
				<Card className="flex flex-col overflow-hidden">
					<CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"} overflow-hidden`}>
						<Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden">
							<TabsList className={`
								grid ${isMobile ? "grid-cols-3" : "grid-cols-5"} // Adjusted for 5 tabs
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
									<Files className={iconSizeClass} />
									All
								</TabsTrigger>
								<TabsTrigger 
									value="mediation" // Updated value
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<FileText className={iconSizeClass} /> {/* Icon for Mediation */}
									Mediation
								</TabsTrigger>
								<TabsTrigger 
									value="intake" 
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<ClipboardList className={iconSizeClass} />
									Intake
								</TabsTrigger>
								<TabsTrigger 
									value="commercial" // New Tab
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<Briefcase className={iconSizeClass} /> {/* Icon for Commercial */}
									Commercial
								</TabsTrigger>
								<TabsTrigger 
									value="workplace" // New Tab
									className={`
										flex items-center justify-center gap-1.5
										${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
										rounded-md
										data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
									`}
								>
									<Users className={iconSizeClass} /> {/* Icon for Workplace */}
									Workplace
								</TabsTrigger>
								{/* Removed Confidentiality, Process, Worksheet specific tabs */}
							</TabsList>

							{/* Title and Search Bar */}
							<div className={`flex flex-col ${isMobile ? "gap-2" : "gap-0"} sm:flex-row sm:justify-between sm:items-center ${isMobile ? "mt-2 mb-1" : "mt-4 mb-2"}`}>
								<CardTitle className={isMobile ? "text-base" : ""}>{getTabTitle()}</CardTitle>
								<div className="relative">
									<Search className={`absolute left-2.5 ${isMobile ? "top-1.5 h-3 w-3" : "top-2.5 h-4 w-4"} text-muted-foreground`} />
									<Input
										placeholder="Search templates..."
										className={`${isMobile ? "text-sm h-8 pl-7" : "pl-8 max-w-xs"}`}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
							</div>

							{/* Tabs Content (Looping through values) */}
							{["all", "mediation", "intake", "commercial", "workplace"].map(tabValue => { // Updated tab values
								const templatesForThisTab = getTemplatesForTab(tabValue, searchTerm);
								return (
									<TabsContent key={tabValue} value={tabValue} className="m-0 pt-0">
										<CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-0 sm:p-4">
											{/* Render filtered templates */}
											
											{/* Render filtered templates */}
											{templatesForThisTab.length > 0 ? (
												templatesForThisTab.map((template) => {
													const styling = getCardStyling(template.category);
													const IconComponent = styling.iconClass;
													return (
														<Card 
															key={template.id} 
															className={`overflow-hidden hover:border-primary/50 transition-colors ${styling.card}`}
															onClick={() => {
																navigate(template.path || `/templates/${template.id}`);
															}}
														>
															<CardHeader className={`${isMobile ? "p-3" : "p-4"} ${styling.header}`}>
																<div className="flex items-start justify-between">
																	<div className="flex items-center gap-2">
																		<div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} rounded-full bg-opacity-20 flex items-center justify-center ${styling.iconText.replace('text-', 'bg-').replace('-600', '-100')}`}>
																			<IconComponent className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} ${styling.iconText}`} />
																		</div>
																		<CardTitle className={`${isMobile ? "text-sm" : "text-base"}`}>{template.title}</CardTitle>
																	</div>
																</div>
															</CardHeader>
															<CardContent className={`${isMobile ? "p-3" : "p-4"}`}>
																<div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground line-clamp-2`}>
																	{template.description}
																</div>
																<div className="flex items-center justify-between mt-4">
																	<div className="flex items-center text-xs text-muted-foreground">
																		<Clock className="mr-1 h-3 w-3" />
																		<span>Used {formatDate(template.lastUsed)}</span>
																	</div>
																	<div className="flex gap-1">
																		<Button size="sm" variant="ghost" className="h-8 w-8 p-0">
																			<Download className="h-4 w-4" />
																		</Button>
																	</div>
																</div>
															</CardContent>
														</Card>
													);
												})
											) : (
												<div className="col-span-full text-center py-10 text-muted-foreground">
													<FileOutput className="mx-auto h-10 w-10 mb-2" />
													<h3 className="font-medium">No templates found</h3>
													<p className="text-sm mt-1">
														{searchTerm ? "Try adjusting your search term." : `No templates found in the "${getTabTitle()}" category.`}
													</p>
												</div>
											)}
										</CardContent>
									</TabsContent>
									)
								})}
							</Tabs>
						</CardHeader>
					</Card>
				</div>

				{/* Dialog for New Template Builder */}
				<Dialog open={templateBuilderOpen} onOpenChange={setTemplateBuilderOpen}>
					<DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Template</DialogTitle>
						</DialogHeader>
						<TemplateBuilder />
					</DialogContent>
				</Dialog>
			</Layout>
		);
	};

	export default TemplatesPage;