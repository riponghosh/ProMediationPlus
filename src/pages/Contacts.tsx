import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, User, UserCog, UserPlus, Users, UsersRound } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateContactDialog, ContactFormValues as CreateContactFormValues } from '@/components/dialogs/create-contact-dialog';
import { EditContactDialog, ContactFormValues as EditContactFormValues } from '@/components/dialogs/edit-contact-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { addItem, deleteItem, getAllItems, putItem } from '@/services/localDbService';
import { toast } from 'sonner';
import { paths } from '@/routes/paths';
import { Contact, Case } from "@/types/models";

// Mock contacts with case file links for fallback seeding
const initialContacts: Contact[] = [
  {
    id: 'contact-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '123-456-7890',
    company: 'Smith & Co',
    type: 'Client',
    linkedCaseFileNumber: 'CF-2023-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'contact-2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '234-567-8901',
    company: 'Johnson Law',
    type: 'Solicitor',
    linkedCaseFileNumber: 'CF-2023-002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'contact-3',
    firstName: 'Robert',
    lastName: 'Brown',
    email: 'robert.brown@example.com',
    phone: '345-678-9012',
    company: 'Brown Consulting',
    type: 'General',
    linkedCaseFileNumber: 'CF-2023-003',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Helper for icon size - matching Settings.tsx
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  const getTypeIcon = (contactType: string | undefined) => {
    const typeLower = contactType?.toLowerCase();
    switch (typeLower) {
      case 'client':
        return <User className={`${iconSizeClass} mr-1.5 flex-shrink-0`} />;
      case 'solicitor':
        return <UserCog className={`${iconSizeClass} mr-1.5 flex-shrink-0`} />;
      case 'new enquiry':
        return <UserPlus className={`${iconSizeClass} mr-1.5 flex-shrink-0`} />;
      default:
        return <Users className={`${iconSizeClass} mr-1.5 flex-shrink-0`} />; // Fallback icon
    }
  };

  // Load contacts and matters from IndexedDB on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        let [loadedContacts, loadedCasesData] = await Promise.all([
          getAllItems('contacts') as Promise<any[]>, // Load as any[] for migration
          getAllItems('cases')
        ]);

        // Migration logic for contacts
        const migratedContacts = loadedContacts.map(c => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const contact: any = { ...c }; // Use any for migration flexibility

          // Migrate name to firstName and lastName
          if (contact.name && (!contact.firstName || !contact.lastName)) {
            const nameParts = String(contact.name).split(' ');
            contact.firstName = nameParts[0] || 'N/A';
            contact.lastName = nameParts.slice(1).join(' ') || 'N/A';
            delete contact.name;
          }

          // Migrate phoneNumber to phone
          if (contact.phoneNumber) {
            contact.phone = contact.phoneNumber;
            delete contact.phoneNumber;
          }

          // Migrate organisation to company
          if (contact.organisation) {
            contact.company = contact.organisation;
            delete contact.organisation;
          }

          // Migrate contactType to type
          if (contact.contactType) {
            contact.type = contact.contactType;
            delete contact.contactType;
          }

          // Migrate caseFileNumbers to linkedCaseFileNumber
          if (contact.caseFileNumbers) {
            if (Array.isArray(contact.caseFileNumbers)) {
              contact.linkedCaseFileNumber = contact.caseFileNumbers[0] || undefined;
            } else if (typeof contact.caseFileNumbers === 'string') {
              contact.linkedCaseFileNumber = contact.caseFileNumbers || undefined;
            }
            delete contact.caseFileNumbers;
          }
          
          // Ensure essential fields have default values if missing
          if (!contact.id) contact.id = uuidv4(); // Ensure ID exists
          if (!contact.firstName) contact.firstName = 'Unknown';
          if (!contact.lastName) contact.lastName = 'Contact';
          if (!contact.email) contact.email = ''; // Default to empty string
          if (!contact.phone) contact.phone = 'N/A'; 
          if (!contact.type) contact.type = 'General';
          if (!contact.createdAt) contact.createdAt = new Date().toISOString();
          if (!contact.updatedAt) contact.updatedAt = new Date().toISOString();

          // Ensure createdAt and updatedAt are strings
          contact.createdAt = String(contact.createdAt);
          contact.updatedAt = String(contact.updatedAt);

          return contact as Contact;
        });

        if (migratedContacts.length === 0 && initialContacts.length > 0) {
          console.log("No contacts found, seeding initial contacts...");
          const contactsToSeed = initialContacts.map(c => ({
            ...c,
            id: c.id || uuidv4(),
            // Ensure all fields from Contact are present, using new names
            firstName: c.firstName || 'N/A',
            lastName: c.lastName || 'N/A',
            email: c.email || '',
            phone: c.phone || 'N/A',
            company: c.company || '',
            type: c.type || 'General',
            linkedCaseFileNumber: c.linkedCaseFileNumber || undefined,
            createdAt: String(c.createdAt || new Date().toISOString()), // Ensure string
            updatedAt: String(c.updatedAt || new Date().toISOString()), // Ensure string
          } as Contact));
          await Promise.all(contactsToSeed.map(c => addItem('contacts', c)));
          const seededContacts = await getAllItems('contacts');
          setContacts(seededContacts as Contact[]);
        } else {
          setContacts(migratedContacts);
          // Persist migrations if any changes were made
          const originalContactsString = JSON.stringify(loadedContacts.sort((a,b) => a.id.localeCompare(b.id)));
          const migratedContactsString = JSON.stringify(migratedContacts.sort((a,b) => a.id.localeCompare(b.id)));
          if(originalContactsString !== migratedContactsString) {
            console.log("Persisting migrated contacts to IndexedDB...");
            await Promise.all(migratedContacts.map(c => putItem('contacts', c)));
          }
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
            // Ensure all fields from Contact are present, using new names
            firstName: c.firstName || 'N/A',
            lastName: c.lastName || 'N/A',
            email: c.email || '',
            phone: c.phone || 'N/A',
            company: c.company || '',
            type: c.type || 'General',
            linkedCaseFileNumber: c.linkedCaseFileNumber || undefined,
            createdAt: String(c.createdAt || new Date().toISOString()), // Ensure string
            updatedAt: String(c.updatedAt || new Date().toISOString()), // Ensure string
          } as Contact));
        setContacts(wellStructuredInitialContacts);    
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
      fullName.includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && contact.type?.toLowerCase() === activeTab.toLowerCase();
  });

  // Get counts for each type of contact
  const newEnquiryCount = contacts.filter(contact => contact.type === "New Enquiry").length;
  const clientCount = contacts.filter(contact => contact.type === "Client").length;
  const solicitorCount = contacts.filter(contact => contact.type === "Solicitor").length;
  const generalCount = contacts.filter(contact => contact.type === "General").length;

  // Handle contact deletion
  const handleDeleteContact = async (id: string) => { // id is string
    try {
      await deleteItem('contacts', id); // Pass string id
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast.success("Contact deleted successfully");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact.");
    }
  };

  // Handle updating a contact
  const handleUpdateContact = async (updatedContactData: EditContactFormValues) => {
    if (!updatedContactData.id) {
        toast.error("Cannot update contact without an ID.");
        return;
    }
    const existingContact = contacts.find(c => c.id === String(updatedContactData.id));
    
    if (!existingContact) {
      toast.error("Contact not found for update.");
      return;
    }

    const updatedContact: Contact = {
        ...existingContact,
        id: String(updatedContactData.id), // Ensure id is string
        firstName: updatedContactData.firstName,
        lastName: updatedContactData.lastName,
        email: updatedContactData.email || "",
        phone: updatedContactData.phone,
        company: updatedContactData.company || "",
        type: updatedContactData.type,
        linkedCaseFileNumber: updatedContactData.linkedCaseFileNumber || undefined,
        updatedAt: new Date().toISOString(), // This will be a string
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
  const handleCreateContact = async (newContactData: CreateContactFormValues) => {
    const newContact: Contact = {
      id: uuidv4(), // Generate ID here
      firstName: newContactData.firstName,
      lastName: newContactData.lastName,
      email: newContactData.email || "",
      phone: newContactData.phone,
      company: newContactData.company || "",
      type: newContactData.type,
      linkedCaseFileNumber: newContactData.linkedCaseFileNumber || undefined,
      createdAt: new Date().toISOString(), // This will be a string
      updatedAt: new Date().toISOString(), // This will be a string
    };
    try {
      await addItem('contacts', newContact);
      setContacts(prev => [...prev, newContact]);
      toast.success(`Contact for ${newContact.firstName} ${newContact.lastName} created successfully`);
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact.");
    }
  };

  const getTabTitle = () => {
    switch(activeTab) {
      case "new enquiry": return "New Enquiries";
      case "client": return "Clients";
      default: return "All Contacts";
    }
  };

  // Define the reusable JSX for rendering the contact list
  const contactListContent = (
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
                      contact={{ // Map Contact to EditContactFormValues
                        id: contact.id,
                        firstName: contact.firstName,
                        lastName: contact.lastName,
                        email: contact.email || "",
                        phone: contact.phone,
                        company: contact.company || "",
                        type: contact.type,
                        linkedCaseFileNumber: contact.linkedCaseFileNumber || ""
                      }}
                      onUpdateContact={handleUpdateContact}
                      onDelete={() => handleDeleteContact(contact.id)}
                    />
                  </div>
                </div>
                {/* Second line: Email and Phone */}
                <div className={`grid ${isMobile ? "grid-cols-1 gap-0.5" : "grid-cols-2 gap-x-4 gap-y-1"} text-muted-foreground ${isMobile ? "text-xs" : "text-sm"} mb-1.5`}>
                  {contact.email && (
                    <div className="flex items-center min-w-0">
                      <Mail className={`${iconSizeClass} mr-1.5 flex-shrink-0`} />
                      <a href={`mailto:${contact.email}`} className="truncate hover:underline">{contact.email}</a>
                    </div>
                  )}
                  {contact.phone && contact.phone !== 'N/A' && (
                    <div className="flex items-center min-w-0">
                      <Phone className={`${iconSizeClass} mr-1.5 flex-shrink-0`} />
                      <span className="truncate">{contact.phone}</span>
                    </div>
                  )}
                </div>
                {/* Third line: Company and Type */}
                <div className={`grid ${isMobile ? "grid-cols-1 gap-0.5" : "grid-cols-2 gap-x-4 gap-y-1"} text-muted-foreground ${isMobile ? "text-xs" : "text-sm"} mb-1.5`}>
                  {contact.company && (
                    <div className="flex items-center min-w-0">
                      <Briefcase className={`${iconSizeClass} mr-1.5 flex-shrink-0`} />
                      <span className="truncate">{contact.company}</span>
                    </div>
                  )}
                  <div className="flex items-center min-w-0">
                    {getTypeIcon(contact.type)}
                    <span className="truncate">{contact.type}</span>
                  </div>
                </div>
                {/* Fourth line: Linked Case File */}
                {contact.linkedCaseFileNumber && (() => {
                  const caseFileNumberStr = contact.linkedCaseFileNumber;
                  const matchingCase = cases.find(c => c.caseFileNumber === caseFileNumberStr);

                  if (matchingCase && matchingCase.id) {
                    return (
                      <div className="flex items-center text-muted-foreground text-xs mt-1">
                        <Link
                          to={`${paths.caseFiles}/${matchingCase.id}/summary`}
                          className="flex items-center hover:underline"
                          title={`View summary for case ${caseFileNumberStr}`}
                        >
                          <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />
                          Linked Case: {caseFileNumberStr}
                        </Link>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center text-muted-foreground text-xs mt-1">
                        <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Linked Case: {caseFileNumberStr} (Details not found)</span>
                      </div>
                    );
                  }
                })()}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No contacts found
              {activeTab !== "all" ? 
                ` matching your criteria in "${getTabTitle().toLowerCase()}"` : 
                (searchTerm ? " matching your search" : "")
              }.
            </div>
          )}
        </div>
      )}
    </CardContent>
  );

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
          <CreateContactDialog 
            onCreateContact={(values) => handleCreateContact(values as CreateContactFormValues)} 
          />
        </div>

        <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
          <CardHeader className={`${isMobile ? "px-2 py-2" : "pb-0"}`}>
            <div className="flex justify-between items-center">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`
                  grid ${isMobile ? "grid-cols-5" : "grid-cols-5"}
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
                    {isMobile ? "Enquiry" : "New Enquiries"} ({newEnquiryCount})
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
                    Clients ({clientCount})
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
                  {contactListContent}
                </TabsContent>
                <TabsContent value="new enquiry" className="m-0 overflow-hidden">
                  {contactListContent}
                </TabsContent>
                <TabsContent value="client" className="m-0 overflow-hidden">
                  {contactListContent}
                </TabsContent>
                <TabsContent value="solicitor" className="m-0 overflow-hidden">
                  {contactListContent}
                </TabsContent>
                <TabsContent value="general" className="m-0 overflow-hidden">
                  {contactListContent}
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
