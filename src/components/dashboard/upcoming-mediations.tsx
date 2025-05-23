import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { paths } from "@/routes/paths";
import { useEffect, useState } from "react";
import { getAllItems } from "@/services/localDbService";
import type { Case } from "@/types/models"; // Import Case type

// Mock data for upcoming mediations
const upcomingMediationsMock = [
	{
		id: 1,
		title: "Smith vs. Johnson Mediation",
		date: "2023-06-15T10:00:00",
		participants: ["John Smith", "Sarah Johnson"],
		location: "Conference Room A",
		caseFileNumber: "CF-2023-001",
	},
	{
		id: 2,
		title: "Property Dispute Resolution",
		date: "2023-06-16T14:30:00",
		participants: ["Michael Brown", "Jennifer Davis"],
		location: "Virtual Meeting",
		caseFileNumber: "CF-2023-002",
	},
	{
		id: 3,
		title: "Employment Contract Negotiation",
		date: "2023-06-18T09:00:00",
		participants: ["Robert Wilson", "Emily Taylor", "Corporate Rep"],
		location: "Conference Room B",
		caseFileNumber: "CF-2023-003",
	},
];

export function UpcomingMediations() {
	const isMobile = useIsMobile();
	const [upcomingMediations, setUpcomingMediations] = useState(upcomingMediationsMock);
	const [cases, setCases] = useState<Case[]>([]); // Renamed from matters to cases

	// Load cases from IndexedDB to get the ID for each caseFileNumber
	useEffect(() => {
		const loadCases = async () => {
			try {
				// 'cases' here is the IndexedDB store name, changed from 'matters'.
				const casesData = await getAllItems("cases");
				setCases(casesData as Case[]); // Renamed from setMatters
			} catch (error) {
				console.error("Error loading cases:", error); // Renamed from matters
			}
		};
		loadCases(); // Renamed from loadMatters
	}, []);

	// Format date in a readable way
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		});
	};

	// Format time from date string
	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Card>
			<CardHeader className={isMobile ? "pb-2" : ""}>
				<CardTitle className={isMobile ? "text-lg" : ""}>Upcoming Mediations</CardTitle>
				<CardDescription>Your scheduled mediation sessions</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{upcomingMediations.map((mediation) => {
						// Find if a corresponding case exists in the loaded cases
						const correspondingCase = cases.find(
							(c) => c.caseFileNumber === mediation.caseFileNumber
						); // Renamed from correspondingMatter and matters

						// Base classes for the card-like div
						const cardDivBaseClasses = `flex flex-col rounded-lg border ${isMobile ? "p-2" : "p-4"}`;

						// Content of the mediation item
						const mediationItemInnerContent = (
							<>
								<h3 className={`font-medium ${isMobile ? "text-sm" : ""}`}>{mediation.title}</h3>
								<div className="flex flex-wrap items-center gap-2 mt-1">
									<div
										className={`flex items-center ${
											isMobile ? "text-xs" : "text-sm"
										} text-muted-foreground gap-1`}
									>
										<Calendar className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
										<span>{formatDate(mediation.date)}</span>
									</div>
									<div
										className={`flex items-center ${
											isMobile ? "text-xs" : "text-sm"
										} text-muted-foreground gap-1`}
									>
										<Clock className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
										<span>{formatTime(mediation.date)}</span>
									</div>
									<div
										className={`flex items-center ${
											isMobile ? "text-xs" : "text-sm"
										} text-muted-foreground gap-1`}
									>
										<FileText className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
										<span>{mediation.caseFileNumber}</span>
									</div>
								</div>

								{/* Only show participants and location on desktop */}
								{!isMobile && (
									<div className="flex flex-col sm:flex-row justify-between mt-2">
										<div className="text-sm text-muted-foreground">
											{mediation.participants.length} participants
										</div>
										<div className="text-sm text-muted-foreground">
											{mediation.location}
										</div>
									</div>
								)}
							</>
						);

						if (correspondingCase) {
							// If the case exists in our cases list // Renamed from correspondingMatter
							return (
								<Link
									to={`${paths.caseFiles}/${correspondingCase.id}/summary`}
									key={mediation.id}
									className="block"
								>
									<div
										className={`${cardDivBaseClasses} hover:bg-muted/50 cursor-pointer transition-colors`}
									>
										{mediationItemInnerContent}
									</div>
								</Link>
							);
						} else {
							// Render as a non-interactive div if caseFileNumber doesn't match any case
							return (
								<div
									key={mediation.id}
									className="block"
								>
									<div
										className={`${cardDivBaseClasses} opacity-60 cursor-not-allowed`}
									>
										{mediationItemInnerContent}
									</div>
								</div>
							);
						}
					})}
				</div>
			</CardContent>
		</Card>
	);
}
