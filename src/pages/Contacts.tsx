import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User, Search, Plus, MoreHorizontal,
  Mail, Phone, Building, Users,
  Filter, Briefcase, UsersRound, UserPlus, UserCog
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateContactDialog } from "@/components/dialogs/create-contact-dialog";
import { EditContactDialog, ContactFormValues } from "@/components/dialogs/edit-contact-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Contact, Case } from "@/types/models";
import { addItem, getAllItems, putItem, deleteItem } from "@/services/localDbService";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock contacts with case file links for fallback seeding
const initialContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '123-456-7890',
    company: 'Smith & Co',
    type: 'Client',
    caseFileNumbers: ['CF-2023-001'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'contact-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '234-567-8901',
    company: 'Johnson Law',
    type: 'Solicitor',
    caseFileNumbers: ['CF-2023-002'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'contact-3',
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    phone: '345-678-9012',
    company: 'Brown Consulting',
    type: 'General',
    caseFileNumbers: ['CF-2023-003'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
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
        const [loadedContacts, loadedMatters] = await Promise.all([
          getAllItems('contacts'),
          getAllItems('matters')
        ]);

        if (loadedContacts.length === 0) {
          console.log("No contacts found, seeding initial contacts...");
          await Promise.all(initialContacts.map(c => addItem('contacts', c)));
          const seededContacts = await getAllItems('contacts');
          setContacts(seededContacts);
        } else {
          setContacts(loadedContacts);
        }

        setMatters(loadedMatters);
        console.log("Contacts loaded from DB:", loadedContacts);
        console.log("Matters loaded from DB:", loadedMatters);
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
        toast.error("Failed to load contacts or matters from local storage.");
        setContacts(initialContacts);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter contacts based on search term and active tab
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      searchTerm === "" ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && contact.type?.toLowerCase() === activeTab.toLowerCase();
  });

  // Get counts for each type of contact
  const newEnquiryCount = contacts.filter(contact => contact.type === "New Enquiry").length;
  const clientCount = contacts.filter(contact => contact.type === "Client").length;
  const solicitorCount = contacts.filter(contact => contact.type === "Solicitor").length;

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
    const updatedContact: Contact = {
        ...(existingContact || {}),
        ...updatedContactData,
        id: String(updatedContactData.id),
        name: updatedContactData.name || existingContact?.name || 'Unknown Name',
        email: updatedContactData.email || existingContact?.email || 'unknown@example.com',
        type: updatedContactData.type || existingContact?.type || 'Unknown Type',
        caseFileNumbers: updatedContactData.caseFileNumbers ?? [],
        createdAt: existingContact?.createdAt ?? new Date(),
        updatedAt: new Date(),
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
                                  <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium truncate`}>{contact.name}</span>
                                </div>
                                <div className="flex-shrink-0">
                                  <EditContactDialog
                                    contact={contact as ContactFormValues}
                                    availableCaseFileNumbers={matters.map(m => m.caseFileNumber)}
                                    onUpdateContact={handleUpdateContact}
                                    onDelete={() => handleDeleteContact(contact.id)}
                                  />
                                </div>
                              </div>
                              
                              {/* Second line: All other contact details */}
                              <div className="ml-11 flex flex-wrap items-center gap-x-2 text-muted-foreground">
                                <div className="flex items-center">
                                  <Mail className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-0.5"}`} />
                                  <span className={`${isMobile ? "text-[0.65rem]" : "text-xs"} truncate max-w-[120px] sm:max-w-[150px]`}>{contact.email}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Phone className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-0.5"}`} />
                                  <span className={`${isMobile ? "text-[0.65rem]" : "text-xs"}`}>{contact.phone || 'N/A'}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Users className={`${isMobile ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-0.5"}`} />
                                  <span className={`${isMobile ? "text-[0.65rem]" : "text-xs"}`}>{contact.type || 'N/A'}</span>
                                </div>
                                {contact.caseFileNumbers && contact.caseFileNumbers.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center space-x-1">
                                      <Briefcase className={`${isMobile ? "h-2.5 w-2.5" : "h-3 w-3"} flex-shrink-0`} />
                                      {contact.caseFileNumbers.map((cfNumber, index) => {
                                        const matter = matters.find(m => m.caseFileNumber === cfNumber);
                                        return matter ? (
                                          <Button
                                            variant="link"
                                            asChild
                                            className={`p-0 h-auto ${isMobile ? "text-[0.65rem]" : "text-xs"} font-medium text-left`}
                                          >
                                            <Link
                                              key={matter.id || cfNumber}
                                              to={`/case-files/${matter.id}/summary`}
                                              title={`View Case File ${cfNumber}`}
                                              className={`text-blue-600 hover:underline ${isMobile ? "text-[0.65rem]" : "text-xs"}`}
                                            >
                                              {cfNumber}
                                            </Link>
                                          </Button>
                                        ) : (
                                          <span key={`${cfNumber}-${index}`} className={`${isMobile ? "text-[0.65rem]" : "text-xs"}`} title="Case file not found">
                                            {cfNumber}
                                          </span>
                                        );
                                      })}
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
