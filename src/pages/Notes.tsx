import { Layout } from "@/components/layout/layout";
import { useState, useEffect } from "react";
import { getAllItems } from "@/services/localDbService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Plus, Clock, Filter } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Local definition for Matter if not properly imported
interface Matter {
	id: string;
	caseFileNumber: string;
	caseFileName?: string;
	// other properties as needed by your application
}

// Mock data for notes
const initialNotes = [
	{
		id: 1,
		title: "Initial Consultation Notes",
		case: "Smith vs. Johnson",
		caseFileNumber: "CF-2023-001",
		date: "2023-06-10T15:30:00",
		category: "consultation",
		excerpt:
			"Parties expressed willingness to discuss settlement terms. Key issues include property division and custody arrangements. Follow-up scheduled for next week.",
	},
	{
		id: 2,
		title: "Property Valuation Discussion",
		case: "Property Dispute",
		caseFileNumber: "CF-2023-002",
		date: "2023-06-09T11:00:00",
		category: "mediation",
		excerpt:
			"Both parties agreed to obtain independent property valuations. Will reconvene after appraisals are complete. Tension seems to be decreasing as we focus on factual matters.",
	},
	{
		id: 3,
		title: "Settlement Agreement Draft",
		case: "Employment Contract",
		caseFileNumber: "CF-2023-003",
		date: "2023-06-07T09:45:00",
		category: "agreement",
		excerpt:
			"Key terms of the settlement agreement were outlined. Employee to receive severance package and letter of recommendation. Employer to withdraw performance concerns from file.",
	},
	{
		id: 4,
		title: "Follow-up Mediation Session",
		case: "Smith vs. Johnson",
		caseFileNumber: "CF-2023-001",
		date: "2023-06-05T13:00:00",
		category: "mediation",
		excerpt:
			"Made progress on several key issues. Parties agreed to temporary arrangements while working toward final agreement. Next session scheduled for June 20.",
	},
	{
		id: 5,
		title: "Pre-Mediation Interview",
		case: "Business Partnership Dissolution",
		caseFileNumber: "CF-2023-004",
		date: "2023-06-01T10:30:00",
		category: "consultation",
		excerpt:
			"Met separately with each partner to understand concerns and goals. Both indicate willingness to negotiate fair division of assets and ongoing projects.",
	},
];

const NotesPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentCategory, setCurrentCategory] = useState("all");
	const [allNotes, setAllNotes] = useState(initialNotes);
	const [matters, setMatters] = useState<Matter[]>([]);
	const { id: caseIdFromParams } = useParams<{ id: string }>();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const loadMatters = async () => {
			try {
				const loadedMatters = (await getAllItems("cases")) as Matter[];
				setMatters(loadedMatters);
			} catch (error) {
				console.error("Failed to load matters", error);
			}
		};
		loadMatters();
	}, []);

	useEffect(() => {
		if (location.state) {
			const { newNote, updatedNote } = location.state as {
				newNote?: any;
				updatedNote?: any;
				caseId?: string;
			};

			if (newNote) {
				setAllNotes((prev) => [newNote, ...prev]);
				toast({
					title: "Note created",
					description: `"${newNote.title}" has been added to your notes`,
				});
			}

			if (updatedNote) {
				setAllNotes((prev) =>
					prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
				);
				toast({
					title: "Note updated",
					description: `"${updatedNote.title}" has been updated`,
				});
			}

			window.history.replaceState({}, document.title);
		}
	}, [location.state]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return "Today";
		if (diffInDays === 1) return "Yesterday";
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	const handleNoteClick = (note: any) => {
		const routeState: { note: any; caseId?: string } = { note };
		if (caseIdFromParams) {
			routeState.caseId = caseIdFromParams;
		}
		navigate("/notes/new", { state: routeState });
	};

	const filteredNotes = allNotes.filter((note) => {
		const matchesSearch =
			searchTerm === "" ||
			note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(note.case && note.case.toLowerCase().includes(searchTerm.toLowerCase())) ||
			note.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory = currentCategory === "all" || note.category === currentCategory;

		let matchesCase = true;
		if (caseIdFromParams) {
			const currentCase = matters.find((m) => m.id === caseIdFromParams);
			if (currentCase) {
				matchesCase = note.caseFileNumber === currentCase.caseFileNumber;
			} else {
				matchesCase = false;
			}
		}

		return matchesSearch && matchesCategory && matchesCase;
	});

	const renderNoteCard = (note: any) => (
		<div
			key={note.id}
			className="rounded-lg border p-4 hover:bg-muted/50 cursor-pointer transition-colors"
			onClick={() => handleNoteClick(note)}
		>
			<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
				<div className="grid gap-1">
					<div className="flex items-center gap-2">
						<FileText className="h-4 w-4 text-mediator-500" />
						<span className="font-medium">{note.title}</span>
					</div>
					<div className="text-sm text-muted-foreground">Case: {note.case}</div>
				</div>
				<div className="flex items-center text-xs text-muted-foreground gap-2 flex-wrap">
					<Clock className="h-3 w-3" />
					<span>{formatDate(note.date)}</span>
					{note.caseFileNumber && (() => {
						const matter = matters.find((m) => m.caseFileNumber === note.caseFileNumber);
						return matter ? (
							<>
								<span>•</span>
								<Link
									to={`/case-files/${matter.id}`}
									className="text-blue-600 hover:underline font-mono"
									title={`View Case File ${note.caseFileNumber}`}
									onClick={(e) => e.stopPropagation()}
								>
									{note.caseFileNumber}
								</Link>
							</>
						) : null;
					})()}
				</div>
			</div>
			<div className="mt-2 text-sm text-muted-foreground line-clamp-2">{note.excerpt}</div>
		</div>
	);

	const renderEmptyState = (categoryForEmptyState = "") => {
		let messageText = "No notes found";
		let createButtonText = "Create Note";
		let createNotePath = "/notes/new";
		let createNoteQuery = "";

		if (caseIdFromParams) {
			const currentCase = matters.find((m) => m.id === caseIdFromParams);
			messageText = `No notes found for case ${currentCase?.caseFileName || caseIdFromParams}`;
			createButtonText = "Create Note for this Case";
			createNoteQuery = `?caseId=${caseIdFromParams}`;
		} else if (categoryForEmptyState && categoryForEmptyState !== "all") {
			messageText = `No ${categoryForEmptyState} notes found`;
			createButtonText = `Create ${categoryForEmptyState} Note`;
		}

		const subMessageText = searchTerm
			? "Try adjusting your search term."
			: `Start by creating your first${caseIdFromParams ? " for this case" : categoryForEmptyState && categoryForEmptyState !== "all" ? ` ${categoryForEmptyState}` : ""} note.`;

		return (
			<div className="text-center py-10 text-muted-foreground">
				<FileText className="mx-auto h-10 w-10 mb-2" />
				<h3 className="font-medium">{messageText}</h3>
				<p className="text-sm mt-1">{subMessageText}</p>
				{!searchTerm && (
					<Button className="mt-4" asChild>
						<Link to={{ pathname: createNotePath, search: createNoteQuery }}>
							<Plus className="mr-2 h-4 w-4" />
							{createButtonText}
						</Link>
					</Button>
				)}
			</div>
		);
	};

	const pageTitle = caseIdFromParams && matters.length > 0
		? `Notes for Case ${matters.find((m) => m.id === caseIdFromParams)?.caseFileName || caseIdFromParams}`
		: "Notes";

	const pageDescription = caseIdFromParams
		? "View and manage notes for this specific case."
		: "Create, view, and manage your mediation notes.";

	const newNoteLinkPath = "/notes/new";
	const newNoteLinkSearch = caseIdFromParams ? `?caseId=${caseIdFromParams}` : "";

	return (
		<Layout>
			<div className="flex flex-col space-y-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
						<p className="text-muted-foreground">{pageDescription}</p>
					</div>
					<Button asChild className="flex gap-2">
						<Link to={{ pathname: newNoteLinkPath, search: newNoteLinkSearch }}>
							<Plus className="h-4 w-4" />
							New Note
						</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<CardTitle>My Notes</CardTitle>
								<CardDescription>Browse and search your notes</CardDescription>
							</div>
							<div className="relative w-full md:w-64">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search notes..."
									className="w-full pl-8"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Tabs defaultValue="all" value={currentCategory} onValueChange={setCurrentCategory}>
							<div className="flex items-center justify-between">
								<TabsList>
									<TabsTrigger value="all">All Notes</TabsTrigger>
									<TabsTrigger value="consultation">Consultations</TabsTrigger>
									<TabsTrigger value="mediation">Mediation</TabsTrigger>
									<TabsTrigger value="agreement">Agreements</TabsTrigger>
								</TabsList>
								{/* Hide category tabs and filter button if in case-specific view, as notes are already filtered by case */}
								{!caseIdFromParams && (
									<Button variant="ghost" size="sm" className="flex gap-1 text-xs">
										<Filter className="h-3 w-3" />
										<span>Filter</span>
									</Button>
								)}
							</div>

							{/* Conditionally render TabsContent based on whether it's a general or case-specific view */}
							{/* If caseIdFromParams is present, we only need one list of notes, not tabbed by category */}
							{caseIdFromParams ? (
								<div className="mt-4 space-y-4">
									{filteredNotes.length > 0
										? filteredNotes.map(renderNoteCard)
										: renderEmptyState() /* No category needed here as it's case specific */
									}
								</div>
							) : (
								<>
									<TabsContent value="all" className="mt-4">
										<div className="space-y-4">
											{filteredNotes.length > 0
												? filteredNotes.map(renderNoteCard)
												: renderEmptyState("all")
											}
										</div>
									</TabsContent>

									<TabsContent value="consultation" className="mt-4">
										<div className="space-y-4">
											{filteredNotes.length > 0
												? filteredNotes.map(renderNoteCard)
												: renderEmptyState("consultation")
											}
										</div>
									</TabsContent>

									<TabsContent value="mediation" className="mt-4">
										<div className="space-y-4">
											{filteredNotes.length > 0
												? filteredNotes.map(renderNoteCard)
												: renderEmptyState("mediation")
											}
										</div>
									</TabsContent>

									<TabsContent value="agreement" className="mt-4">
										<div className="space-y-4">
											{filteredNotes.length > 0
												? filteredNotes.map(renderNoteCard)
												: renderEmptyState("agreement")
											}
										</div>
									</TabsContent>
								</>
							)}
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default NotesPage;
