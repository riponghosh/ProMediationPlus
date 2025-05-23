import { useState, useEffect, useCallback } from 'react';
// import { localDbService } from '@services/localDbService'; // TODO: Create this service and uncomment import
// import type { CaseFileMetadata } from '@types/models'; // TODO: Create this type or use the definition below and remove import
import { useToast } from '../use-toast'; // Use relative path

// Define a basic type if not available - uncomment if '@types/models' is not used
type CaseFileMetadata = {
  id: string;
  caseId: string;
//   name: string;
//   type: string;
//   size: number;
//   localPath?: string; // Path if stored locally on device (e.g., via File System Access API)
//   remoteUrl?: string; // URL if stored remotely
//   createdAt: Date;
//   updatedAt: Date;
// };

interface UseCaseFileMetadataLocalResult {
	metadataList: CaseFileMetadata[];
	isLoading: boolean;
	error: Error | null;
	addFileMetadata: (
		metadata: Omit<CaseFileMetadata, 'id' | 'createdAt' | 'updatedAt'>,
	) => Promise<string | undefined>;
	updateFileMetadata: (
		id: string,
		updates: Partial<CaseFileMetadata>,
	) => Promise<void>;
	deleteFileMetadata: (id: string) => Promise<void>;
	refreshMetadata: () => void;
}

/**
 * Hook to manage case file metadata stored locally in IndexedDB.
 * Assumes localDbService provides access to an 'caseFiles' object store
 * indexed by 'caseId'.
 *
 * @param caseId The ID of the case to fetch metadata for.
 * @returns {UseCaseFileMetadataLocalResult} Metadata list, loading/error states, and modification functions.
 */
export function useCaseFileMetadataLocal(
	caseId: string | undefined,
): UseCaseFileMetadataLocalResult {
	const [metadataList, setMetadataList] = useState<CaseFileMetadata[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);
	const { toast } = useToast();

	const fetchMetadata = useCallback(async () => {
		if (!caseId) {
			setMetadataList([]);
			setIsLoading(false);
			setError(null);
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			// TODO: Uncomment when localDbService is implemented
			// const data = await localDbService.caseFiles.getAll('caseId', caseId);
			const data: CaseFileMetadata[] = []; // Placeholder
			// Ensure dates are Date objects if IndexedDB stores them differently
			const processedData = data.map((meta) => ({
				...meta,
				createdAt: new Date(meta.createdAt),
				updatedAt: new Date(meta.updatedAt),
			}));
			setMetadataList(processedData);
		} catch (err) {
			console.error('Error fetching local case file metadata:', err);
			setError(
				err instanceof Error ? err : new Error('Failed to load local file data'),
			);
			toast({
				title: 'Error Loading Files',
				description: 'Could not load file information from local storage.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	}, [caseId, toast]);

	useEffect(() => {
		fetchMetadata();
	}, [fetchMetadata]);

	const addFileMetadata = useCallback(
		async (
			metadata: Omit<CaseFileMetadata, 'id' | 'createdAt' | 'updatedAt'>,
		): Promise<string | undefined> => {
			setIsLoading(true);
			setError(null);
			try {
				// TODO: Uncomment when localDbService is implemented
				// const newId = await localDbService.caseFiles.add({
				// 	...metadata,
				// 	// Ensure caseId is set if not already present
				// 	caseId: caseId ?? metadata.caseId,
				// });
				const newId = crypto.randomUUID(); // Placeholder ID
				await fetchMetadata(); // Refresh list after adding
				toast({
					title: 'File Added (Locally - Placeholder)',
					description: `${metadata.name} added locally.`,
				});
				return newId;
			} catch (err) {
				console.error('Error adding local case file metadata:', err);
				setError(
					err instanceof Error ? err : new Error('Failed to add local file data'),
				);
				toast({
					title: 'Error Adding File',
					description: 'Could not save file information locally.',
					variant: 'destructive',
				});
				return undefined;
			} finally {
				setIsLoading(false);
			}
		},
		[fetchMetadata, toast, caseId],
	);

	const updateFileMetadata = useCallback(
		async (id: string, updates: Partial<CaseFileMetadata>): Promise<void> => {
			setIsLoading(true);
			setError(null);
			try {
				// TODO: Uncomment when localDbService is implemented
				// await localDbService.caseFiles.update(id, {
				// 	...updates,
				// 	updatedAt: new Date(), // Ensure updatedAt is updated
				// });
				await fetchMetadata(); // Refresh list after updating
				toast({
					title: 'File Updated (Locally - Placeholder)',
					description: 'File information updated locally.',
				});
			} catch (err) {
				console.error('Error updating local case file metadata:', err);
				setError(
					err instanceof Error
						? err
						: new Error('Failed to update local file data'),
				);
				toast({
					title: 'Error Updating File',
					description: 'Could not update file information locally.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		},
		[fetchMetadata, toast],
	);

	const deleteFileMetadata = useCallback(
		async (id: string): Promise<void> => {
			setIsLoading(true);
			setError(null);
			try {
				// Optional: Add logic here to delete the actual file if stored locally
				// e.g., using File System Access API handle if `localPath` exists

				// TODO: Uncomment when localDbService is implemented
				// await localDbService.caseFiles.delete(id);
				await fetchMetadata(); // Refresh list after deleting
				toast({
					title: 'File Deleted (Locally - Placeholder)',
					description: 'File information removed locally.',
				});
			} catch (err) {
				console.error('Error deleting local case file metadata:', err);
				setError(
					err instanceof Error
						? err
						: new Error('Failed to delete local file data'),
				);
				toast({
					title: 'Error Deleting File',
					description: 'Could not remove file information locally.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		},
		[fetchMetadata, toast],
	);

	return {
		metadataList,
		isLoading,
		error,
		addFileMetadata,
		updateFileMetadata,
		deleteFileMetadata,
		refreshMetadata: fetchMetadata, // Expose a manual refresh function
	};
}