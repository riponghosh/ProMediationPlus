import { openDB, DBSchema, IDBPDatabase, IDBPTransaction } from 'idb';
import { v4 as uuidv4 } from 'uuid';

import type { 
  MediatorMateDBSchema, 
  Case, 
  Note, 
  // Contact, // Assuming Contact is not available or not used here
  Document, 
  Task, 
  CaseFileMetadata, 
  Meeting,
  TimelineEvent,
  ChecklistItem,
  SavedForm
} from '@/types/models';

const DATABASE_NAME = 'MediatorMateDB';
const DATABASE_VERSION = 9; // Incremented due to schema changes (contacts store removal)

let dbPromise: Promise<IDBPDatabase<MediatorMateDBSchema>> | null = null;

type StoreNameUnion = "cases" | "notes" | "documents" | "tasks" | "caseFiles" | "timeline" | "checklistItems" | "meetings" | "forms";

const getDb = (): Promise<IDBPDatabase<MediatorMateDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<MediatorMateDBSchema>(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(db: IDBPDatabase<MediatorMateDBSchema>, oldVersion: number, newVersion: number | null, transaction: IDBPTransaction<MediatorMateDBSchema, StoreNameUnion[], "versionchange">) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

        const ensureStoreAndIndexes = <SName extends StoreNameUnion>(
          storeName: SName,
          keyPathOption: IDBObjectStoreParameters | undefined = { keyPath: 'id' },
          indexConfigs: Array<{
            indexName: Extract<keyof MediatorMateDBSchema[SName]['indexes'], string>;
            keyPath: string | string[];
            options?: IDBIndexParameters;
          }>
        ) => {
          let store;
          if (!db.objectStoreNames.contains(storeName)) {
            store = db.createObjectStore(storeName, keyPathOption);
            console.log(`Created '${storeName}' object store.`);
          } else {
            store = transaction.objectStore(storeName);
            console.log(`Ensuring indexes for existing '${storeName}' object store.`);
          }
          indexConfigs.forEach(config => {
            if (!store.indexNames.contains(config.indexName)) {
              store.createIndex(config.indexName, config.keyPath, config.options);
            }
          });
        };

        // --- Store Definitions ---
        ensureStoreAndIndexes('cases', { keyPath: 'id' }, [
          { indexName: 'caseFileNumber', keyPath: 'caseFileNumber', options: { unique: true } },
          { indexName: 'clientName', keyPath: 'clientName' },
          { indexName: 'status', keyPath: 'status' },
          { indexName: 'title', keyPath: 'title' },
        ]);

        ensureStoreAndIndexes('notes', { keyPath: 'id' }, [
          { indexName: 'by-caseFileNumber', keyPath: 'caseFileNumber' },
          { indexName: 'createdAt', keyPath: 'createdAt' },
        ]);

        const oldContactsStoreName = 'contacts';
        // IDBDatabase.objectStoreNames is a DOMStringList, which has a .contains(string) method.
        // Cast to DOMStringList to satisfy TypeScript strictness if db.objectStoreNames is typed more narrowly.
        if ((db.objectStoreNames as unknown as DOMStringList).contains(oldContactsStoreName)) {
          db.deleteObjectStore(oldContactsStoreName as any); // Cast to any for deletion as it's not in current schema
          console.log(`Deleted '${oldContactsStoreName}' object store as it is no longer defined in the schema.`);
        }

        ensureStoreAndIndexes('documents', { keyPath: 'id' }, [
          { indexName: 'by-caseId', keyPath: 'caseId' },
          { indexName: 'by-type', keyPath: 'type' },
          { indexName: 'title', keyPath: 'title' },
        ]);

        ensureStoreAndIndexes('tasks', { keyPath: 'id' }, [
          { indexName: 'by-status', keyPath: 'status' },
          { indexName: 'by-dueDate', keyPath: 'dueDate' },
          { indexName: 'caseId', keyPath: 'caseId' },
          { indexName: 'priority', keyPath: 'priority' },
        ]);

        ensureStoreAndIndexes('caseFiles', { keyPath: 'id' }, [
          { indexName: 'by-caseId', keyPath: 'caseId' },
          { indexName: 'by-name', keyPath: 'name' },
          { indexName: 'by-parent', keyPath: ['caseId', 'parentId'] }, // Compound index
          { indexName: 'type', keyPath: 'type' },
        ]);
        
        ensureStoreAndIndexes('timeline', { keyPath: 'id' }, [
          { indexName: 'caseId', keyPath: 'caseId' },
          { indexName: 'date', keyPath: 'date' },
          { indexName: 'type', keyPath: 'type' },
        ]);

        ensureStoreAndIndexes('checklistItems', { keyPath: 'id' }, [
          { indexName: 'caseId', keyPath: 'caseId' },
          { indexName: 'completed', keyPath: 'completed' }, 
          { indexName: 'category', keyPath: 'category' },
          { indexName: 'createdAt', keyPath: 'createdAt' },
        ]);

        ensureStoreAndIndexes('meetings', { keyPath: 'id' }, [
          { indexName: 'caseId', keyPath: 'caseId' },
          { indexName: 'date', keyPath: 'date' },
          { indexName: 'title', keyPath: 'title' },
        ]);
        
        ensureStoreAndIndexes('forms', { keyPath: 'id' }, [
          { indexName: 'by-formTitle', keyPath: 'formTitle' },
        ]);

      },
      blocked() {
        console.error('IndexedDB blocked. Close other tabs using the database.');
      },
      blocking() {
        console.warn('IndexedDB blocking. Database upgrade needed but blocked.');
      },
      terminated() {
        console.error('IndexedDB connection terminated unexpectedly.');
        dbPromise = null; 
      },
    });
  }
  return dbPromise;
};

// --- Generic CRUD Operations ---

export const addItem = async <Store extends StoreNameUnion>(
  storeName: Store,
  item: MediatorMateDBSchema[Store]['value']
): Promise<IDBValidKey> => {
  try {
    const db = await getDb();
    return await db.add(storeName, item);
  } catch (error) {
    console.error(`Error adding item to ${storeName}:`, error);
    throw new Error(`Failed to add item to ${storeName}`);
  }
};

export const getItem = async <Store extends StoreNameUnion>(
  storeName: Store,
  key: string 
): Promise<MediatorMateDBSchema[Store]['value'] | undefined> => {
  try {
    const db = await getDb();
    return await db.get(storeName, key);
  } catch (error) {
    console.error(`Error getting item with key ${key} from ${storeName}:`, error);
    throw new Error(`Failed to get item from ${storeName}`);
  }
};

export const getAllItems = async <Store extends StoreNameUnion>(
  storeName: Store
): Promise<MediatorMateDBSchema[Store]['value'][]> => {
  try {
    const db = await getDb();
    return await db.getAll(storeName);
  } catch (error) {
    console.error(`Error getting all items from ${storeName}:`, error);
    throw new Error(`Failed to get all items from ${storeName}`);
  }
};

export const getItemsByIndex = async <
    Store extends StoreNameUnion,
    Idx extends Extract<keyof MediatorMateDBSchema[Store]['indexes'], string>
>(
  storeName: Store,
  indexName: Idx,
  query: IDBValidKey | IDBKeyRange // Keep as general type for flexibility
): Promise<MediatorMateDBSchema[Store]['value'][]> => {
  try {
    const db = await getDb();
    console.log(`localDbService.getItemsByIndex: store='${storeName}', index='${indexName}', query (raw):`, query, `(stringified): ${JSON.stringify(query)}`);
    // Cast query to `any` to bypass overly strict type checking here, as idb handles it.
    return await db.getAllFromIndex(storeName, indexName, query as any);
  } catch (error) {
    console.error(`Error getting items from index ${String(indexName)} in ${storeName} with query ${JSON.stringify(query)}:`, error);
    throw new Error(`Failed to get items by index from ${storeName}`);
  }
};

export const putItem = async <Store extends StoreNameUnion>(
  storeName: Store,
  item: MediatorMateDBSchema[Store]['value']
): Promise<IDBValidKey> => {
  try {
    const db = await getDb();
    return await db.put(storeName, item);
  } catch (error) {
    console.error(`Error putting item in ${storeName}:`, error);
    throw new Error(`Failed to put item in ${storeName}`);
  }
};

export const deleteItem = async <Store extends StoreNameUnion>(
  storeName: Store,
  key: string 
): Promise<void> => {
  try {
    const db = await getDb();
    await db.delete(storeName, key);
  } catch (error) {
    console.error(`Error deleting item with key ${key} from ${storeName}:`, error);
    throw new Error(`Failed to delete item from ${storeName}`);
  }
};

export const clearStore = async <Store extends StoreNameUnion>(
  storeName: Store
): Promise<void> => {
    try {
        const db = await getDb();
        await db.clear(storeName);
        console.log(`Store "${storeName}" cleared successfully.`);
    } catch (error) {
        console.error(`Error clearing store ${storeName}:`, error);
        throw new Error(`Failed to clear store ${storeName}`);
    }
};

// --- Specific Operations ---

export const getNotesForCase = async (caseFileNumber: string): Promise<Note[]> => {
    return getItemsByIndex('notes', 'by-caseFileNumber', caseFileNumber);
};

export const getDocumentsForCase = async (caseId: string): Promise<Document[]> => {
    return getItemsByIndex('documents', 'by-caseId', caseId);
};

export const getTasksByStatus = async (status: Task['status']): Promise<Task[]> => {
    return getItemsByIndex('tasks', 'by-status', status);
};

export const getTasksByDueDate = async (date: Date): Promise<Task[]> => {
    // IDBKeyRange or a specific Date object can be used for querying date ranges or exact dates.
    // If querying for an exact date, it should be passed directly.
    return getItemsByIndex('tasks', 'by-dueDate', date);
};

export const getCasesByStatus = async (status: Case['status']): Promise<Case[]> => {
    return getItemsByIndex('cases', 'status', status);
};

// getContactsByName would require Contact type to be defined and exported in models.ts
// and the 'contacts' store to be created in the upgrade function.
// export const getContactsByName = async (name: string): Promise<Contact[]> => {
//     return getItemsByIndex('contacts', 'by-name', name);
// };

export const addTimelineEvent = async (event: TimelineEvent): Promise<IDBValidKey> => {
  if (!event.id) event.id = uuidv4();
  return addItem('timeline', event);
};

export const getTimelineForCase = async (caseId: string): Promise<TimelineEvent[]> => {
  const db = await getDb();
  const tx = db.transaction('timeline', 'readonly');
  const store = tx.objectStore('timeline');
  const index = store.index('caseId');
  // Cast caseId to any for compatibility with getAll method if strict typing causes issues
  let events = await index.getAll(caseId as any);
  
  events = events.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createdA - createdB;
  });

  await tx.done;
  return events;
};

export const addChecklistItem = async (item: ChecklistItem): Promise<IDBValidKey> => {
  if (!item.id) item.id = uuidv4();
  const now = new Date().toISOString();
  item.createdAt = item.createdAt || now;
  item.updatedAt = now;
  return addItem('checklistItems', item);
};

export const getChecklistItemsForCase = async (caseId: string, completed?: boolean): Promise<ChecklistItem[]> => {
  const db = await getDb();
  const tx = db.transaction('checklistItems', 'readonly');
  const store = tx.objectStore('checklistItems');
  const index = store.index('caseId');
  // Cast caseId to any for compatibility with getAll method if strict typing causes issues
  let items = await index.getAll(caseId as any);

  if (typeof completed === 'boolean') {
    items = items.filter(item => item.completed === completed);
  }

  items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  await tx.done;
  return items;
};

export const updateChecklistItem = async (item: ChecklistItem): Promise<IDBValidKey> => {
  return putItem('checklistItems', { ...item, updatedAt: new Date().toISOString() });
};

export const deleteChecklistItem = async (itemId: string): Promise<void> => {
  return deleteItem('checklistItems', itemId);
};

export const addMeeting = async (meeting: Meeting): Promise<IDBValidKey> => {
  if (!meeting.id) meeting.id = uuidv4();
  const now = new Date().toISOString();
  meeting.createdAt = meeting.createdAt || now;
  meeting.updatedAt = now;
  return addItem('meetings', meeting);
};

export const getMeetingsForCase = async (caseId: string): Promise<Meeting[]> => {
  const db = await getDb();
  const tx = db.transaction('meetings', 'readonly');
  const store = tx.objectStore('meetings');
  const index = store.index('caseId');
  // Cast caseId to any for compatibility with getAll method if strict typing causes issues
  const meetings = await index.getAll(caseId as any);
  await tx.done;
  return meetings.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateB - dateA; // Most recent first
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createdB - createdA;
  });
};

export const updateMeeting = async (meeting: Meeting): Promise<IDBValidKey> => {
  meeting.updatedAt = new Date().toISOString();
  return putItem('meetings', meeting);
};

export const deleteMeeting = async (meetingId: string): Promise<void> => {
  return deleteItem('meetings', meetingId);
};

// Initialize DB connection when service loads (optional)
getDb().then(() => console.log("DB connection OK.")).catch(console.error);