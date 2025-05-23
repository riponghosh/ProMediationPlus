import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import axios from 'axios'; // Added import for axios
import {
  Upload,
  X,
  UserCircle, // Added Icon
  Settings as SettingsIcon, // Added Icon (aliased)
  Palette, // Added Icon
  CreditCard, // Added Icon
  Bell, // Added Icon
  Repeat // Added Icon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from 'react-router-dom';
import {
  initiateCalendlyAuth,
  getCalendlyUserInfo,
  getCalendlyEventTypes,
  disconnectCalendly,
  getStoredCalendlyAccessToken,
  refreshCalendlyToken, // Added import
} from '../services/calendlyService';
import { CalendlyUserResource, CalendlyEventTypeResource } from '../types/calendlyTypes';

const SettingsPage = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

  // Calendly specific state and handlers
  const [calendlyUser, setCalendlyUser] = useState<CalendlyUserResource | null>(null);
  const [eventTypes, setEventTypes] = useState<CalendlyEventTypeResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  const location = useLocation();
  const navigate = useNavigate();

  // Check for messages from CalendlyCallbackPage
  useEffect(() => {
    const locationState = location.state as { calendlySuccessMessage?: string; calendlyErrorMessage?: string } | null;
    if (locationState?.calendlySuccessMessage) {
      setActionMessage(locationState.calendlySuccessMessage);
      fetchCalendlyStatus(); // Fetch data after successful connection
      navigate(location.pathname, { replace: true, state: {} }); // Clear the state
    } else if (locationState?.calendlyErrorMessage) {
      setError(locationState.calendlyErrorMessage);
      setActionMessage(''); // Clear any success message
      navigate(location.pathname, { replace: true, state: {} }); // Clear the state
    }
  }, [location.state, location.pathname, navigate]);

  // Fetch Calendly Status
  const fetchCalendlyStatus = async () => {
    setIsLoading(true);
    setError('');
    // setActionMessage('');

    let token = getStoredCalendlyAccessToken();
    if (!token) {
      setCalendlyUser(null);
      setEventTypes([]);
      setIsLoading(false);
      return;
    }

    try {
      const userInfo = await getCalendlyUserInfo();
      setCalendlyUser(userInfo);
      if (userInfo && userInfo.uri) {
        const eventTypesResponse = await getCalendlyEventTypes(userInfo.uri);
        if (eventTypesResponse && typeof eventTypesResponse === 'object' && Array.isArray(eventTypesResponse.collection)) {
          setEventTypes(eventTypesResponse.collection);
        } else {
          console.warn('getCalendlyEventTypes returned an unexpected response structure. Expected { collection: array }.', eventTypesResponse);
          setError('Failed to parse Calendly event types. Displaying an empty list.');
          setEventTypes([]); // Fallback to empty array
        }
      } else if (!userInfo) {
        // If userInfo is null (e.g. token was invalid and cleared by getCalendlyUserInfo or initial load with no token)
        setEventTypes([]);
      } else {
        // This case implies userInfo is truthy but userInfo.uri is not, which is unexpected for a valid user object.
        console.warn('Calendly user info fetched but URI is missing.', userInfo);
        setError('Could not fetch event types due to missing user URI.');
        setEventTypes([]);
      }
    } catch (err: any) {
      // Check if it\'s an auth error (401/403) that might be fixed by a refresh token
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log('Access token expired or invalid, attempting refresh...');
        try {
          const refreshed = await refreshCalendlyToken();
          if (refreshed && refreshed.access_token) {
            console.log('Token refreshed successfully, retrying fetchCalendlyStatus...');
            const refreshedUserInfo = await getCalendlyUserInfo();
            setCalendlyUser(refreshedUserInfo);
            if (refreshedUserInfo && refreshedUserInfo.uri) {
              const eventTypesResponse = await getCalendlyEventTypes(refreshedUserInfo.uri);
              if (eventTypesResponse && typeof eventTypesResponse === 'object' && Array.isArray(eventTypesResponse.collection)) {
                setEventTypes(eventTypesResponse.collection);
              } else {
                console.warn('getCalendlyEventTypes (after refresh) returned an unexpected response structure. Expected { collection: array }.', eventTypesResponse);
                setError('Failed to parse Calendly event types after token refresh. Displaying an empty list.');
                setEventTypes([]); // Fallback to empty array
              }
            } else if (!refreshedUserInfo) {
                // If refreshedUserInfo is null after attempting refresh
                setEventTypes([]);
            } else {
                // This case implies refreshedUserInfo is truthy but refreshedUserInfo.uri is not
                console.warn('Refreshed Calendly user info fetched but URI is missing.', refreshedUserInfo);
                setError('Could not fetch event types after refresh due to missing user URI.');
                setEventTypes([]);
            }
            setError(''); // Clear previous auth error
          } else {
            setError('Calendly session expired. Please reconnect.');
            setCalendlyUser(null);
            setEventTypes([]);
            localStorage.removeItem('calendly_access_token');
            localStorage.removeItem('calendly_refresh_token');
          }
        } catch (refreshError: any) {
          console.error('Failed to refresh Calendly token:', refreshError);
          setError('Calendly session expired. Please reconnect.');
          setCalendlyUser(null);
          setEventTypes([]);
          localStorage.removeItem('calendly_access_token');
          localStorage.removeItem('calendly_refresh_token');
        }
      } else if (err && err.error) { // This is for CalendlyError from our service (e.g., { error: "message" })
        setError(err.error);
        setCalendlyUser(null);
        setEventTypes([]);
      } else {
        // More detailed logging for unexpected errors
        let detailedErrorMessage = 'Failed to fetch Calendly status. Please try again.';
        if (axios.isAxiosError(err)) { // Check if it's an Axios error
          if (err.response) {
            // Error response from backend
            detailedErrorMessage = `Backend error: ${err.response.status} - ${JSON.stringify(err.response.data)}. Please check server logs.`;
          } else if (err.request) {
            // Request was made but no response received
            detailedErrorMessage = 'No response received from backend. Is the server running and accessible?';
          } else {
            // Something happened in setting up the request that triggered an Error
            detailedErrorMessage = `Axios error: ${err.message}.`;
          }
        } else if (err instanceof Error) { // Generic JavaScript error
          detailedErrorMessage = `Unexpected error: ${err.message}.`;
        }
        setError(detailedErrorMessage);
        setCalendlyUser(null);
        setEventTypes([]);
        console.error("Full error object in fetchCalendlyStatus:", err); // Log the full error object
      }
      console.info("Could not fetch Calendly status (raw error):", err); // Keep existing log
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to fetch status on mount
  useEffect(() => {
    fetchCalendlyStatus();
  }, []);

  // Handle Connect Calendly
  const handleConnectCalendly = () => {
    setError('');
    setActionMessage('');
    initiateCalendlyAuth();
  };

  // Handle Disconnect Calendly
  const handleDisconnectCalendly = async () => {
    setIsLoading(true);
    setError('');
    // setActionMessage(''); // Optional: Clear previous action messages
    try {
      const response = await disconnectCalendly(); // Service clears tokens from localStorage
      setActionMessage(response.message || 'Successfully disconnected from Calendly.');
      setCalendlyUser(null);
      setEventTypes([]);
    } catch (err: any) {
      setError(err.error || 'Failed to disconnect from Calendly. Tokens have been cleared locally.');
      // Even if disconnect fails on server, tokens are cleared by service, so UI reflects disconnected state.
      setCalendlyUser(null);
      setEventTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to clear messages after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (actionMessage || error) {
      timer = setTimeout(() => {
        setActionMessage('');
        // setError(''); // Decide if errors should also auto-clear, or persist until next action
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [actionMessage, error]);

  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <Layout>
      <div className={`flex flex-col h-full ${isMobile ? "space-y-4" : "space-y-6"}`}> {/* Added h-full */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account settings and preferences
            </p>
          </div>
          {/* Optional: Add a global save button here if needed */}
        </div>

        <Tabs defaultValue="profile" className="w-full flex-1 flex flex-col"> {/* Added flex-1 flex flex-col */}
          {/* === MODIFIED TabsList === */}
          <TabsList className={`
            grid ${isMobile ? "grid-cols-3" : "grid-cols-6"}
            w-full
            h-auto p-1
            bg-muted rounded-lg
            gap-1
            ${!isMobile ? 'md:w-auto md:inline-grid' : ''} // Adjust width behavior on desktop
          `}>
            <TabsTrigger
              value="profile"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <UserCircle className={iconSizeClass} /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="branding"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <Palette className={iconSizeClass} /> Branding
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <CreditCard className={iconSizeClass} /> Billing
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <Bell className={iconSizeClass} /> Notifications
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <Repeat className={iconSizeClass} /> {isMobile ? "Subs" : "Subscriptions"}
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className={`
                flex items-center justify-center gap-1.5
                ${isMobile ? 'text-xs px-2 py-1.5' : 'text-sm px-3 py-1.5'}
                rounded-md
                data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
              `}
            >
              <SettingsIcon className={iconSizeClass} /> Integrations
            </TabsTrigger>
          </TabsList>
          {/* === END MODIFIED TabsList === */}

          {/* Tabs Content - Make scrollable if needed */}
          <div className="flex-1 overflow-y-auto mt-4 md:mt-6"> {/* Added container for scroll */}
            <TabsContent value="profile" className="mt-0 space-y-1.5"> {/* Reduced space-y */}
              <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Personal Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-1.5 ${isMobile ? "p-4 pt-0" : ""}`}> {/* Reduced space-y */}
                  {/* ... existing form fields ... */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5"> {/* Reduced gap */}
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label className="text-sm font-medium" htmlFor="first-name">First Name</Label>
                      <Input id="first-name" placeholder="John" defaultValue="Andrew" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                    </div>
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label className="text-sm font-medium" htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" placeholder="Smith" defaultValue="Rooney" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                    </div>
                  </div>
                  <div className="space-y-0.5"> {/* Reduced space-y */}
                    <Label className="text-sm font-medium" htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john.smith@example.com" defaultValue="andrew@mediator-mate.com" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                  </div>
                  <div className="space-y-0.5"> {/* Reduced space-y */}
                    <Label className="text-sm font-medium" htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="(555) 123-4567" defaultValue="(555) 987-6543" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                  </div>
                  <div className="space-y-0.5"> {/* Reduced space-y */}
                    <Label className="text-sm font-medium" htmlFor="bio">Professional Bio</Label>
                    <Textarea id="bio" placeholder="Tell clients about your background and experience" defaultValue="Professional mediator with over 10 years of experience specializing in family law and business disputes." className={`min-h-[80px] ${isMobile ? "text-xs" : "text-sm"}`}/> {/* Adjusted min-height and text size */}
                  </div>
                  <Button size={isMobile ? "sm" : "default"}>Save Changes</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Professional Information</CardTitle>
                  <CardDescription>Update your professional details</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-1.5 ${isMobile ? "p-4 pt-0" : ""}`}> {/* Reduced space-y */}
                  {/* ... existing form fields ... */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5"> {/* Reduced gap */}
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label className="text-sm font-medium" htmlFor="profession">Profession</Label>
                      <Input id="profession" placeholder="Mediator" defaultValue="Mediator" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                    </div>
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label className="text-sm font-medium" htmlFor="company">Company/Organization</Label>
                      <Input id="company" placeholder="Mediation Services LLC" defaultValue="Mediator Mate Solutions" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5"> {/* Reduced gap */}
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label className="text-sm font-medium" htmlFor="specialization">Specialization</Label>
                      <Select defaultValue="family">
                        <SelectTrigger id="specialization" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}> {/* Adjusted height and text size */}
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="family">Family Mediation</SelectItem>
                          <SelectItem value="business">Business Mediation</SelectItem>
                          <SelectItem value="workplace">Workplace Mediation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label className="text-sm font-medium" htmlFor="experience">Years of Experience</Label>
                      <Input id="experience" placeholder="5" defaultValue="10" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                    </div>
                  </div>
                  <Button size={isMobile ? "sm" : "default"}>Save Changes</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Account Settings</CardTitle>
                  <CardDescription>Update your account preferences</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-1.5 ${isMobile ? "p-4 pt-0" : ""}`}> {/* Reduced space-y */}
                  <div className="space-y-0.5"> {/* Reduced space-y */}
                    <Label className="text-sm font-medium" htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="andrew_mediator" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                  </div>
                  <div className="space-y-0.5"> {/* Reduced space-y */}
                    <Label className="text-sm font-medium" htmlFor="password">Change Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                  </div>
                  <div className="space-y-0.5"> {/* Reduced space-y */}
                    <Label className="text-sm font-medium" htmlFor="password-confirm">Confirm Password</Label>
                    <Input id="password-confirm" type="password" placeholder="••••••••" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                  </div>
                  <Button size={isMobile ? "sm" : "default"}>Update Password</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="mt-0 space-y-1.5"> {/* Reduced space-y */}
              {/* START CALENDLY INTEGRATION UI */}
              <Card> {/* Wrap in a Card for consistency */}
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Calendly Integration</CardTitle>
                  <CardDescription>Connect your Calendly account to manage your schedule.</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-3 ${isMobile ? "p-4 pt-0" : ""}`}> {/* Adjusted space */}
                  {actionMessage && <p className="text-sm text-green-600 mb-2">{actionMessage}</p>}
                  {error && <p className="text-sm text-red-600 mb-2">Error: {error}</p>}

                  {isLoading && <p className="text-sm text-muted-foreground">Loading Calendly status...</p>}

                  {!isLoading && !calendlyUser && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Connect your Calendly account to manage your schedule directly from this app.</p>
                      <Button onClick={handleConnectCalendly} size={isMobile ? "sm" : "default"}> {/* CORRECTED: Use existing Button and size prop */}
                        Connect to Calendly
                      </Button>
                    </div>
                  )}

                  {!isLoading && calendlyUser && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {calendlyUser.avatar_url && (
                          <img
                            src={calendlyUser.avatar_url}
                            alt="Calendly Avatar"
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">Connected as: {calendlyUser.name}</p>
                          <p className="text-xs text-muted-foreground">{calendlyUser.email}</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        Your Calendly Scheduling URL:{' '}
                        <a href={calendlyUser.scheduling_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {calendlyUser.scheduling_url}
                        </a>
                      </p>

                      <h4 className={`${isMobile ? "text-sm" : "text-base"} font-medium mt-2`}>Your Event Types:</h4> {/* Adjusted heading size */}
                      {eventTypes.length > 0 ? (
                        <ul className="list-none p-0 space-y-2">
                          {eventTypes.map(eventType => (
                            <li key={eventType.uri} className="p-3 border rounded-md bg-muted/50">
                              <p className="font-semibold text-sm">{eventType.name} <span className={`text-xs ${eventType.active ? 'text-green-600' : 'text-red-600'}`}>({eventType.active ? 'Active' : 'Inactive'})</span> - {eventType.duration} mins</p>
                              <a href={eventType.scheduling_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                Booking Link
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No event types found or you might need to refresh.</p>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <Button onClick={handleDisconnectCalendly} variant="destructive" size={isMobile ? "sm" : "default"}> {/* CORRECTED: Use existing Button, variant, and size prop */}
                          Disconnect Calendly
                        </Button>
                        <Button onClick={fetchCalendlyStatus} variant="secondary" size={isMobile ? "sm" : "default"}> {/* CORRECTED: Use existing Button, variant, and size prop */}
                          Refresh Data
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* END CALENDLY INTEGRATION UI */}
            </TabsContent>

            <TabsContent value="branding" className="mt-0 space-y-1.5"> {/* Reduced space-y */}
              {/* ... Branding Content ... */}
               <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Business Branding</CardTitle>
                  <CardDescription>Customize how your business appears on documents and client communications</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-4 ${isMobile ? "p-4 pt-0" : ""}`}>
                  {/* ... Logo Upload ... */}
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <Label htmlFor="logo" className="text-sm font-medium">Company Logo</Label>
                    {logo ? (
                      <div className={`relative ${isMobile ? "w-40" : "w-60"}`}>
                        <img src={logo} alt="Company logo" className="max-h-40 max-w-full object-contain border rounded p-2" />
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full bg-foreground/10 hover:bg-foreground/20" onClick={removeLogo}>
                          <X className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                        </Button>
                      </div>
                    ) : (
                      <div className={`flex flex-col items-center justify-center ${isMobile ? "w-40 h-30" : "w-60 h-40"} border border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted/50`}>
                        <Input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload}/>
                        <Label htmlFor="logo" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                          <Upload className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} text-muted-foreground mb-2`} />
                          <span className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>Click to upload your logo</span>
                          <span className={`${isMobile ? "text-[10px]" : "text-xs"} text-muted-foreground mt-1`}>SVG, PNG or JPG (max. 2MB)</span>
                        </Label>
                      </div>
                    )}
                  </div>
                  {/* ... Business Info ... */}
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <h3 className={isMobile ? "text-base font-medium" : "text-lg font-medium"}>Business Information</h3>
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input id="business-name" placeholder="Mediator Mate Solutions Ltd." className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                    </div>
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label htmlFor="business-address">Business Address</Label>
                      <Textarea id="business-address" placeholder="123 Mediation Street
City, State 12345
Country" className={`min-h-[80px] ${isMobile ? "text-xs" : "text-sm"}`}/> {/* Adjusted min-height and text size */}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5"> {/* Reduced gap */}
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="business-email">Business Email</Label>
                        <Input id="business-email" type="email" placeholder="contact@yourcompany.com" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="business-phone">Business Phone</Label>
                        <Input id="business-phone" placeholder="(555) 123-4567" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5"> {/* Reduced gap */}
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="business-website">Website</Label>
                        <Input id="business-website" type="url" placeholder="https://yourcompany.com" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="business-registration">Company Registration Number</Label>
                        <Input id="business-registration" placeholder="12345678" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                    </div>
                  </div>
                  {/* ... VAT Info ... */}
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <h3 className={isMobile ? "text-base font-medium" : "text-lg font-medium"}>VAT Information</h3>
                    <div className="flex items-center space-x-2 mb-1.5"> {/* Reduced mb */}
                      <Checkbox id="vat-registered" />
                      <Label htmlFor="vat-registered" className="text-sm font-medium">My business is VAT registered</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5"> {/* Reduced gap */}
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="vat-number">VAT Number</Label>
                        <Input id="vat-number" placeholder="GB123456789" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="vat-rate">Default VAT Rate (%)</Label>
                        <Input id="vat-rate" type="number" placeholder="20" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                    </div>
                  </div>
                  <Button size={isMobile ? "sm" : "default"}>Save Branding Information</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-0 space-y-1.5"> {/* Reduced space-y */}
              {/* ... Billing Content ... */}
               <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Billing Information</CardTitle>
                  <CardDescription>Manage your payment methods and billing details</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-1.5 ${isMobile ? "p-4 pt-0" : ""}`}> {/* Reduced space-y */}
                  {/* ... Current Plan ... */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={isMobile ? "font-medium text-sm" : "font-medium"}>Current Plan</h4>
                      <p className="text-sm text-muted-foreground">Professional ($29/month)</p>
                    </div>
                    <Button variant="outline" size={isMobile ? "sm" : "default"}>Change Plan</Button>
                  </div>
                  {/* ... Payment Method ... */}
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <h4 className={isMobile ? "font-medium text-sm" : "font-medium"}>Payment Method</h4>
                    <div className="flex items-center justify-between border p-1.5 rounded"> {/* Reduced padding */}
                      <div className="flex items-center">
                        <div className={`${isMobile ? "h-5 w-8" : "h-6 w-10"} rounded bg-muted`}></div> {/* Adjusted placeholder size */}
                        <span className={`ml-2 ${isMobile ? "text-xs" : "text-sm"}`}>•••• •••• •••• 4242</span> {/* Applied text size */}
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                  {/* ... Billing Address ... */}
                  <div className="space-y-1.5"> {/* Reduced space-y */}
                    <h4 className={isMobile ? "font-medium text-sm" : "font-medium"}>Billing Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5"> {/* Reduced gap */}
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="billing-name">Name on Card</Label>
                        <Input id="billing-name" placeholder="John Smith" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="billing-email">Billing Email</Label>
                        <Input id="billing-email" type="email" placeholder="john.smith@example.com" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                    </div>
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label htmlFor="billing-address">Street Address</Label>
                      <Input id="billing-address" placeholder="123 Main St" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5"> {/* Reduced gap */}
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="billing-city">City</Label>
                        <Input id="billing-city" placeholder="Anytown" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="billing-state">State/Province</Label>
                        <Input id="billing-state" placeholder="CA" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                      <div className="space-y-0.5"> {/* Reduced space-y */}
                        <Label htmlFor="billing-zip">Postal Code</Label>
                        <Input id="billing-zip" placeholder="12345" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}/> {/* Adjusted height and text size */}
                      </div>
                    </div>
                    <div className="space-y-0.5"> {/* Reduced space-y */}
                      <Label htmlFor="billing-country">Country</Label>
                      <Select defaultValue="us">
                        <SelectTrigger id="billing-country" className={`${isMobile ? "h-8 text-xs" : "h-9 text-sm"}`}> {/* Adjusted height and text size */}
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1.5"> {/* Reduced padding top */}
                    <Button variant="outline" size={isMobile ? "sm" : "default"}>Billing History</Button>
                    <Button size={isMobile ? "sm" : "default"}>Save Billing Information</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-4">
              {/* ... Notifications Content ... */}
               <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Notification Settings</CardTitle>
                  <CardDescription>Control how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-4 ${isMobile ? "p-4 pt-0" : ""}`}>
                  {/* ... Email Notifications ... */}
                  <div>
                    <h4 className={`${isMobile ? "text-sm" : ""} font-medium mb-3`}>Email Notifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-new-case" defaultChecked />
                        <Label htmlFor="email-new-case" className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}>New case assignments</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-meeting" defaultChecked />
                        <Label htmlFor="email-meeting" className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}>Meeting reminders</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-documents" defaultChecked />
                        <Label htmlFor="email-documents" className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}>Document updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-task" />
                        <Label htmlFor="email-task" className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}>Task assignments</Label>
                      </div>
                    </div>
                  </div>
                  {/* ... System Notifications ... */}
                  <div>
                    <h4 className={`${isMobile ? "text-sm" : ""} font-medium mb-3`}>System Notifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="system-meetings" defaultChecked />
                        <Label htmlFor="system-meetings" className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}>Meeting alerts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="system-tasks" defaultChecked />
                        <Label htmlFor="system-tasks" className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}>Task deadlines</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="system-updates" defaultChecked />
                        <Label htmlFor="system-updates" className={`${isMobile ? "text-xs" : "text-sm"} font-normal`}>System updates</Label>
                      </div>
                    </div>
                  </div>
                  <Button size={isMobile ? "sm" : "default"}>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-0 space-y-1.5"> {/* Reduced space-y */}
              {/* ... Subscriptions Content ... */}
               <Card>
                <CardHeader className={isMobile ? "p-4" : ""}>
                  <CardTitle className={isMobile ? "text-base" : ""}>Subscription Management</CardTitle>
                  <CardDescription>Manage your Mediator Mate subscription plan</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-1.5 ${isMobile ? "p-4 pt-0" : ""}`}> {/* Reduced space-y */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={isMobile ? "font-medium text-sm" : "font-medium"}>Current Plan</h4>
                      <p className="text-sm text-muted-foreground">Professional ($29/month)</p>
                    </div>
                    <Button variant="outline" size={isMobile ? "sm" : "default"}>Change Plan</Button>
                  </div>
                  <Button variant="destructive" size={isMobile ? "sm" : "default"}>Cancel Subscription</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;