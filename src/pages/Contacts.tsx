import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, User, UserCog, UserPlus, Users, UsersRound } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateContactDialog } from '@/components/dialogs/create-contact-dialog';
import { EditContactDialog, ContactFormValues } from '@/components/dialogs/edit-contact-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { addItem, deleteItem, getAllItems, putItem } from '@/services/localDbService';
import { toast } from 'sonner';
import { paths } from '@/routes/paths';
import { Contact, Case } from "@/types/models";

// Mock contacts with case file links for fallback seeding
const initialContacts: Contact[] = [
  {
    id: 'contact-1',
    // name: 'John Smith', // This property is part of the extended Contact, not BaseDocument
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phoneNumber: '123-456-7890',
    organisation: 'Smith & Co',
    contactType: 'Client', // Added contactType
    caseFileNumbers: 'CF-2023-001', // Changed to string
    createdAt: new Date().toISOString(), // Ensure ISO string for dates
    updatedAt: new Date().toISOString(), // Ensure ISO string for dates
  },
  {
    id: 'contact-2',
    // name: 'Sarah Johnson', // This property is part of the extended Contact, not BaseDocument
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phoneNumber: '234-567-8901',
    organisation: 'Johnson Law',
    contactType: 'Solicitor', // Added contactType
    caseFileNumbers: 'CF-2023-002', // Changed to string
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'contact-3',
    // name: 'Robert Brown', // This property is part of the extended Contact, not BaseDocument
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@example.com',
    phoneNumber: '345-678-9012',
    organisation: 'Brown Consulting',
    contactType: 'General', // Added contactType
    caseFileNumbers: 'CF-2023-003', // Changed to string
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cases, setCases] = useState<Case[]>([]); // Renamed from matters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Helper for icon size - matching Settings.tsx
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  // Load contacts and matters from IndexedDB on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let [loadedContacts, loadedCasesData] = await Promise.all([
          getAllItems('contacts') as Promise<any[]>, // Load as any[] for potential migration
          getAllItems('cases')
        ]);

        // Simple migration: Check for old structure (name field) and convert
        // Also ensure essential fields like firstName, lastName, contactType are present
        const migratedContacts = loadedContacts.map(c => {
          const contact = { ...c }; // Create a mutable copy
          if (contact.name && (!contact.firstName || !contact.lastName)) {
            const nameParts = String(contact.name).split(' ');
            contact.firstName = nameParts[0] || 'N/A';
            contact.lastName = nameParts.slice(1).join(' ') || 'N/A';
            delete contact.name; // Remove old name field
          }
          // Ensure essential fields have default values if missing
          if (!contact.firstName) contact.firstName = 'Unknown';
          if (!contact.lastName) contact.lastName = 'Contact';
          if (!contact.contactType) contact.contactType = 'General'; // Default contact type
          if (Array.isArray(contact.caseFileNumbers)) { // If old array format, take first or empty string
            contact.caseFileNumbers = contact.caseFileNumbers[0] || '';
          } else if (typeof contact.caseFileNumbers === 'undefined') {
            contact.caseFileNumbers = ''; // Ensure it's at least an empty string
          }
          if (!contact.createdAt) contact.createdAt = new Date().toISOString();
          if (!contact.updatedAt) contact.updatedAt = new Date().toISOString();
          
          return contact as Contact;
        });

        if (migratedContacts.length === 0 && initialContacts.length > 0) {
          console.log("No contacts found, seeding initial contacts...");
          // Ensure initialContacts also conform to the latest structure if they were somehow outdated
          const contactsToSeed = initialContacts.map(c => ({
            ...c,
            id: c.id || uuidv4(),
            firstName: c.firstName || 'N/A',
            lastName: c.lastName || 'N/A',
            contactType: c.contactType || 'General',
            caseFileNumbers: typeof c.caseFileNumbers === 'string' ? c.caseFileNumbers : '',
            createdAt: c.createdAt || new Date().toISOString(),
            updatedAt: c.updatedAt || new Date().toISOString(),
          }));
          await Promise.all(contactsToSeed.map(c => addItem('contacts', c)));
          const seededContacts = await getAllItems('contacts');
          setContacts(seededContacts as Contact[]);
        } else {
          setContacts(migratedContacts);
          // Optionally, update the stored contacts if migration occurred
          // This is a good practice to avoid re-migrating every time
          // However, be cautious with bulk updates if not needed frequently
          // For now, we'll just use the migrated data in state.
          // If you want to persist migrations:
          // await Promise.all(migratedContacts.map(c => putItem('contacts', c)));
        }

        setCases(loadedCasesData as Case[]);
        console.log("Contacts loaded (and potentially migrated) from DB:", migratedContacts);
        console.log("Cases loaded from DB:", loadedCasesData);
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
        toast.error("Failed to load contacts or cases from local storage.");
        // Fallback to initialContacts, ensuring they are also well-structured
        const wellStructuredInitialContacts = initialContacts.map(c => ({
            ...c,
            id: c.id || uuidv4(),
            firstName: c.firstName || 'N/A',
            lastName: c.lastName || 'N/A',
            contactType: c.contactType || 'General',
            caseFileNumbers: typeof c.caseFileNumbers === 'string' ? c.caseFileNumbers : '',
            createdAt: c.createdAt || new Date().toISOString(),
            updatedAt: c.updatedAt || new Date().toISOString(),
          }));
        setContacts(wellStructuredInitialContacts as Contact[]);      
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter contacts based on search term and active tab
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) || // Search by full name
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phoneNumber && contact.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.organisation && contact.organisation.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === "all") return matchesSearch;
    // Ensure contactType is checked safely
    return matchesSearch && contact.contactType?.toLowerCase() === activeTab.toLowerCase();
  });

  // Get counts for each type of contact
  const newEnquiryCount = contacts.filter(contact => contact.contactType === "New Enquiry").length;
  const clientCount = contacts.filter(contact => contact.contactType === "Client").length;
  const solicitorCount = contacts.filter(contact => contact.contactType === "Solicitor").length;

  // Handle contact deletion
  const handleDeleteContact = async (id: string | number) => {
    try {
      await deleteItem('contacts', String(id));
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast.success("Contact deleted successfully");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact.");
    }
  };

  // Handle updating a contact
  const handleUpdateContact = async (updatedContactData: ContactFormValues) => {
    if (!updatedContactData.id) {
        toast.error("Cannot update contact without an ID.");
        return;
    }
    const existingContact = contacts.find(c => c.id === String(updatedContactData.id));
    
    // Construct the updated contact, ensuring all fields from Contact type are present
    // and correctly typed from ContactFormValues.
    const updatedContact: Contact = {
        ...(existingContact || {}), // Spread existing contact first to retain all its properties
        id: String(updatedContactData.id),
        firstName: updatedContactData.name ? updatedContactData.name.split(' ')[0] : existingContact?.firstName || 'N/A',
        lastName: updatedContactData.name ? updatedContactData.name.split(' ').slice(1).join(' ') : existingContact?.lastName || 'N/A',
        email: updatedContactData.email || existingContact?.email,
        phoneNumber: updatedContactData.phone || existingContact?.phoneNumber,
        organisation: updatedContactData.company || existingContact?.organisation,
        contactType: (updatedContactData.type as Contact["contactType"]) || existingContact?.contactType || 'General',
        caseFileNumbers: updatedContactData.caseFileNumbers || existingContact?.caseFileNumbers || '',
        // Retain other fields from existingContact if not in updatedContactData
        roleInCase: existingContact?.roleInCase,
        associatedCaseIds: existingContact?.associatedCaseIds,
        billingRate: existingContact?.billingRate,
        paymentTerms: existingContact?.paymentTerms,
        communicationHistory: existingContact?.communicationHistory,
        notes: existingContact?.notes,
        preferredContactMethod: existingContact?.preferredContactMethod,
        drtReferral: existingContact?.drtReferral,
        drtReferralDate: existingContact?.drtReferralDate,
        drtReferralSource: existingContact?.drtReferralSource,
        drtReferralContact: existingContact?.drtReferralContact,
        drtReferralOutcome: existingContact?.drtReferralOutcome,
        drtReferralNotes: existingContact?.drtReferralNotes,
        createdAt: existingContact?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    try {
      await putItem('contacts', updatedContact);
      setContacts(prev =>
        prev.map(contact => contact.id === updatedContact.id ? updatedContact : contact)
      );
      toast.success("Contact updated successfully");
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact.");
    }
  };

  // Handle creating a new contact
  const handleCreateContact = async (newContactData: Omit<Contact, 'id'> & { id?: string | number }) => {
    const contactToSave: Contact = {
        ...newContactData,
        id: newContactData.id || uuidv4(),
     } as Contact;

    try {
      const addedKey = await addItem('contacts', contactToSave);
      const finalContact: Contact = { ...contactToSave, id: String(addedKey) };
      setContacts(prev => [...prev, finalContact]);
      toast.success("Contact created successfully");
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact.");
    }
  };

  const getTabTitle = () => {
    switch(activeTab) {
      case "new enquiry": return "New Enquiries";
      case "client": return "Clients";
      case "solicitor": return "Solicitors";
      default: return "All Contacts";
    }
  };

  return (
    <Layout>
      <div className={`flex flex-col h-full ${isMobile ? "space-y-4" : "space-y-6"}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Contacts</h1>
            <p className="text-muted-foreground text-sm">
              Manage all your clients and professional contacts
            </p>
          </div>
          <CreateContactDialog onCreateContact={handleCreateContact} />
        </div>

        <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
          <CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"}`}>
            <div className="flex justify-between items-center">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`
                  grid ${isMobile ? "grid-cols-4" : "grid-cols-4"}
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
                    <UsersRound className={iconSizeClass} />
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="new enquiry" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <UserPlus className={iconSizeClass} />
                    {isMobile ? "Enquiry" : "New Enquiries"}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="client" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <User className={iconSizeClass} />
                    Clients
                  </TabsTrigger>
                  <TabsTrigger 
                    value="solicitor" 
                    className={`
                      flex items-center justify-center gap-1.5
                      ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                      rounded-md
                      data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                    `}
                  >
                    <UserCog className={iconSizeClass} />
                    {isMobile ? "Sols" : "Solicitors"}
                  </TabsTrigger>
                </TabsList>
                
                <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-0"} sm:flex-row sm:justify-between sm:items-center ${isMobile ? "mt-2 mb-1" : "mt-4 mb-2"}`}>
                  <CardTitle className={isMobile ? "text-base" : ""}>{getTabTitle()}</CardTitle>
                  <Input 
                    placeholder="Search contacts..." 
                    className={`${isMobile ? "text-sm h-8" : "max-w-xs"}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <TabsContent value="all" className="m-0 overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    {isLoading ? (
                      <div className="p-6 text-center text-muted-foreground">Loading contacts...</div>
                    ) : (
                      <div className="divide-y">
                        {filteredContacts.length > 0 ? (
                          filteredContacts.map((contact) => (
                            <div
                              key={contact.id}
                              className={`${isMobile ? "p-2" : "p-4"} hover:bg-muted/50 transition-colors`}
                            >
                              {/* First line: Contact name and edit button */}
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center min-w-0">
                                  <div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3`}>
                                    <User className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                                  </div>
                                  <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium truncate`}>{`${contact.firstName} ${contact.lastName}`}</span>
                                </div>
                                <div className="flex-shrink-0">
                                  <EditContactDialog
                                    contact={{
                                      id: contact.id,
                                      name: `${contact.firstName} ${contact.lastName}`,
                                      email: contact.email || "",
                                      phone: contact.phoneNumber || "",
                                      company: contact.organisation || "",
                                      type: contact.contactType || "General",
                                      caseFileNumbers: contact.caseFileNumbers || ""
                                    } as ContactFormValues}
                                    // availableCaseFileNumbers={cases.map(c => c.caseFileNumber)} // Removed as it's no longer needed
                                    onUpdateContact={handleUpdateContact}
                                    onDelete={() => handleDeleteContact(contact.id)}
                                  />
                                </div>
                              </div>
                              
                              {/* Second line: All other contact details */}
                              <div className="ml-11 flex flex-wrap items-center gap-x-2 text-muted-foreground">
                                <div className="flex items-center">
                                  <Mail className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-0.5"}`} />
                                  {contact.email}
                                </div>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Phone className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-0.5"}`} />
                                  {contact.phoneNumber}
                                </div>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Users className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-0.5"}`} />
                                  {contact.organisation}
                                </div>
                                {contact.caseFileNumbers && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-x-1">
                                      <Briefcase className={`${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
                                      {(() => {
                                        const caseFileNumber = contact.caseFileNumbers; // Now a string
                                        const matchingCase = cases.find(c => c.caseFileNumber === caseFileNumber);
                                        if (matchingCase && matchingCase.id) {
                                          return (
                                            <Link
                                              key={matchingCase.id}
                                              to={`${paths.caseFiles}/${matchingCase.id}/summary`}
                                              className="text-blue-600 hover:underline"
                                              title={`View summary for case ${caseFileNumber}`}
                                            >
                                              {caseFileNumber}
                                            </Link>
                                          );
                                        } else {
                                          return (
                                            <span key={caseFileNumber} title="Case details not found or ID missing">
                                              {caseFileNumber}
                                            </span>
                                          );
                                        }
                                      })()}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={`${isMobile ? "p-4 text-sm" : "p-6"} text-center text-muted-foreground`}>
                            <p>No contacts found.</p>
                            <div className="mt-2">
                              <CreateContactDialog onCreateContact={handleCreateContact} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </TabsContent>
              </Tabs>
            </div>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
};

export default ContactsPage;
