import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiFileText, FiFolder, FiTrash2, FiUploadCloud, FiFolderPlus, FiChevronRight, FiHardDrive, FiImage, FiArchive } from 'react-icons/fi';
import { Layout } from '@/components/layout/layout'; // Corrected import casing
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { storageService } from '@/services/storageService';
import { CaseFileMetadata } from '@/types/models';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const MOCK_CASE_ID = 'case-123'; // Replace with actual case ID logic

// Breadcrumb Item type
interface BreadcrumbItem {
  name: string;
  path: string;
  parentId: string | null;
}

const StoragePage: React.FC = () => {
  const [items, setItems] = useState<CaseFileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // currentPath is the path of the folder currently being viewed.
  // For root, it's '/'. For a folder 'docs' at root, it's '/docs/'.
  const [currentPath, setCurrentPath] = useState<string>('/'); 
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ name: 'Case Storage', path: '/', parentId: null }]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await storageService.getItems(MOCK_CASE_ID, currentParentId);
      setItems(fetchedItems.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      }));
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items.');
    } finally {
      setIsLoading(false);
    }
  }, [currentParentId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.info("No files selected or files were rejected.");
      return;
    }
    setIsLoading(true);
    try {
      for (const file of acceptedFiles) {
        // currentPath is the path of the directory where the file is being uploaded.
        await storageService.uploadFile(MOCK_CASE_ID, currentPath, file, currentParentId);
        toast.success(`File "${file.name}" uploaded successfully.`);
      }
      fetchItems();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error uploading files.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, currentParentId, currentPath]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true, // Dropzone itself is not clickable, button will trigger it
    noKeyboard: true,
  });

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error('Folder name cannot be empty.');
      return;
    }
    setIsLoading(true);
    try {
      // currentPath is the path of the parent directory for the new folder.
      await storageService.createFolder(MOCK_CASE_ID, currentPath, folderName.trim(), currentParentId);
      toast.success(`Folder "${folderName.trim()}" created successfully.`);
      setFolderName('');
      setIsCreateFolderOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Error creating folder.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (item: CaseFileMetadata) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone, and all contents of a folder will also be deleted.`)) {
      return;
    }
    setIsLoading(true);
    try {
      await storageService.deleteItem(item.id);
      toast.success(`"${item.name}" deleted successfully.`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: CaseFileMetadata) => {
    if (item.type === 'folder') {
      setCurrentParentId(item.id);
      setCurrentPath(item.path); // The path of the folder itself becomes the new currentPath
      
      const newCrumb = { name: item.name, path: item.path, parentId: item.id }; 
      setBreadcrumbs([...breadcrumbs, newCrumb]);
    } else {
      toast.info(`File "${item.name}" clicked. Preview/download not yet implemented.`);
      // Optional: Implement file download/preview
      // const content = await storageService.getFileContent(item.id);
      // if (content) { /* ... handle content ... */ }
    }
  };
  
  const handleBreadcrumbClick = (index: number) => {
    const crumb = breadcrumbs[index];
    setCurrentParentId(crumb.parentId); 
    setCurrentPath(crumb.path);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const getFileIcon = (item: CaseFileMetadata) => {
    const iconSize = 22; 
    if (item.type === 'folder') {
      return <FiFolder size={iconSize} className="mr-3 text-blue-500 flex-shrink-0" />;
    }
    const fileType = item.fileType || item.type; // Use specific fileType if available, else general type
    if (fileType?.startsWith('image/')) {
      return <FiImage size={iconSize} className="mr-3 text-green-500 flex-shrink-0" />; // Corrected: FiImage
    }
    if (fileType === 'application/pdf') {
      return <FiFileText size={iconSize} className="mr-3 text-red-500 flex-shrink-0" />;
    }
    if (fileType?.startsWith('application/vnd.openxmlformats-officedocument') || fileType === 'application/msword') {
        return <FiFileText size={iconSize} className="mr-3 text-blue-700 flex-shrink-0" />;
    }
    if (fileType === 'application/zip' || fileType?.includes('archive')) {
        return <FiArchive size={iconSize} className="mr-3 text-yellow-600 flex-shrink-0" />; // Corrected: FiArchive
    }
    return <FiFileText size={iconSize} className="mr-3 text-gray-500 flex-shrink-0" />;
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            Storage
          </h1>
          <p className="text-gray-600">Manage your case files and folders for Case ID: {MOCK_CASE_ID}</p>
        </header>

        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1 overflow-x-auto whitespace-nowrap">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <FiChevronRight className="text-gray-400 mx-1 flex-shrink-0" />}
                <Button
                  variant="link"
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`px-2 py-1 text-base ${index === breadcrumbs.length - 1 ? 'font-semibold text-indigo-700' : 'text-gray-600 hover:text-indigo-600'}`}
                  disabled={isLoading}
                >
                  {crumb.name}
                </Button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex space-x-2 flex-shrink-0">
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-indigo-600 border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700">
                  <FiFolderPlus size={18} className="mr-2" /> New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Create a new folder in: {breadcrumbs[breadcrumbs.length - 1].path}
                  </DialogDescription>
                </DialogHeader>
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="my-4"
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateFolder} disabled={isLoading || !folderName.trim()}>
                    {isLoading ? 'Creating...' : 'Create Folder'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button {...getRootProps({onClick: e => e.preventDefault()})} // Prevent default if using a custom click handler elsewhere
              variant="default" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => document.getElementById('fileInput')?.click()} // Manually trigger hidden input
            >
              <FiUploadCloud size={18} className="mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
        
        <div 
          {...getRootProps()} 
          className={`mb-6 p-8 border-2 border-dashed rounded-lg text-center 
                      ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          {/* Hidden input for useDropzone, triggered by the Upload button */}
          <input {...getInputProps()} id="fileInput" style={{ display: 'none' }} /> 
          {isDragActive ? (
            <p className="text-indigo-700 font-semibold">Drop the files here ...</p>
          ) : (
            <p className="text-gray-500">Drag 'n' drop files here, or click the "Upload Files" button.</p>
          )}
        </div>

        {isLoading && <p className="text-center text-gray-500 py-8">Loading items...</p>}
        
        {!isLoading && items.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <FiFolder size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-medium">This folder is empty.</p>
            <p>Upload files or create a new folder to get started.</p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-lg font-medium text-gray-700">Contents of: {breadcrumbs[breadcrumbs.length - 1].path}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ScrollArea className="h-[calc(100vh-420px)] min-h-[200px]"> 
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center group">
                      <div 
                        className="flex items-center cursor-pointer flex-grow min-w-0" // min-w-0 for truncation
                        onClick={() => handleItemClick(item)}
                        onKeyPress={(e) => e.key === 'Enter' && handleItemClick(item)}
                        tabIndex={0} 
                        title={item.name}
                      >
                        {getFileIcon(item)}
                        <span className="font-medium text-gray-700 truncate pr-2">{item.name}</span>
                        {item.type === 'folder' && <FiChevronRight size={20} className="ml-auto text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 ml-2 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleDeleteItem(item);
                        }}
                        aria-label={`Delete ${item.name}`}
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StoragePage;
