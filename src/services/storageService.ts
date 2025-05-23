// src/services/storageService.ts
import { v4 as uuidv4 } from 'uuid';
import { 
  addItem,
  getItem,
  getItemsByIndex,
  deleteItem as deleteDbItem,
} from './localDbService';
import { CaseFileMetadata } from '@/types/models';

const ROOT_PARENT_ID = 'root';

export const storageService = {
  async uploadFile(
    caseId: string, 
    currentFolderPath: string, 
    file: File, 
    parentId: string | null
  ): Promise<CaseFileMetadata> {
    const fileId = uuidv4();
    const now = new Date();

    const fileBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileBuffer], { type: file.type });
    
    // Path for a file is its parent folder's path + file name
    const filePath = currentFolderPath.endsWith('/') ? `${currentFolderPath}${file.name}` : `${currentFolderPath}/${file.name}`;

    const metadata: CaseFileMetadata = {
      id: fileId,
      name: file.name,
      caseId: caseId,
      type: file.type || 'file', // Use mime type or generic 'file'
      fileType: file.type || 'application/octet-stream', // Explicit mime type
      size: file.size,
      createdAt: now, 
      updatedAt: now, 
      path: filePath, 
      content: fileBlob, 
      isDeleted: false,
      lastModified: file.lastModified,
      parentId: parentId ?? ROOT_PARENT_ID, // Use 'root' for root
    };

    await addItem('caseFiles', metadata);
    return metadata;
  },

  async createFolder(
    caseId: string, 
    parentFolderPath: string, 
    folderName: string, 
    parentId: string | null
  ): Promise<CaseFileMetadata> {
    const folderId = uuidv4();
    const now = new Date();
    
    // Path for a new folder is its parent's path + new folder name + /
    const newFolderPath = parentFolderPath.endsWith('/') ? `${parentFolderPath}${folderName}/` : `${parentFolderPath}/${folderName}/`;

    const metadata: CaseFileMetadata = {
      id: folderId,
      name: folderName,
      caseId: caseId,
      type: 'folder',
      createdAt: now,
      updatedAt: now,
      path: newFolderPath, 
      isDeleted: false,
      parentId: parentId ?? ROOT_PARENT_ID, // Use 'root' for root
      content: null, 
    };

    await addItem('caseFiles', metadata);
    return metadata;
  },

  async getItems(caseId: string, parentId: string | null): Promise<CaseFileMetadata[]> {
    const pid = parentId ?? ROOT_PARENT_ID; // Use 'root' for root
    return getItemsByIndex('caseFiles', 'by-parent', [caseId, pid]);
  },
  
  async getAllItemsForCase(caseId: string): Promise<CaseFileMetadata[]> {
    return getItemsByIndex('caseFiles', 'by-caseId', caseId);
  },

  async deleteItem(itemId: string): Promise<void> {
    const item = await getItem('caseFiles', itemId);
    if (!item) {
      console.warn(`Item with id ${itemId} not found for deletion.`);
      return; 
    }

    if (item.type === 'folder') { 
      const children = await getItemsByIndex('caseFiles', 'by-parent', [item.caseId, item.id]);
      for (const child of children) {
        await this.deleteItem(child.id); 
      }
    }
    await deleteDbItem('caseFiles', itemId);
  },

  async getFileContent(fileId: string): Promise<Blob | null | undefined> {
    const metadata = await getItem('caseFiles', fileId);
    return metadata?.content; 
  }
};
