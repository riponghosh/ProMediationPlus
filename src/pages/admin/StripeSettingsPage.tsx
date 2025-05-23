import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  ExternalLink, 
  Globe, 
  Key, 
  Lock, 
  ReceiptText, 
  Save, 
  ShieldCheck, 
  Wallet 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Mock Stripe configuration data
const stripeConfig = {
  connected: true,
  mode: "test",
  accountId: "acct_1LkrT7CRy7YtB88Z",
  publicKey: {
    live: "pk_live_xxxxxxxxxxxxxxxxxxxxx",
    test: "pk_test_51LkrT7CRy7YtB88Z9eJWOD8GtZ5djGU2RQSCghnHxM6zIcn4vGrLa8SH3Eag7clPfU2YGxAJCv5zFBDzVjAfJcU600tOj2BDQE"
  },
  secretKey: {
    live: "sk_live_xxxxxxxxxxxxxxxxxxxxx",
    test: "sk_test_51LkrT7CRy7YtB88Z9eJWOD8GtZ5djGU2RQSCghnHxM6zIcn4vGrLa8SH3Eag7clPfU2YGxAJCv5zFBDzVjAfJcU600tOj2BDQE"
  },
  webhookSecret: {
    live: "whsec_xxxxxxxxxxxxxxxxxxxxx",
    test: "whsec_12345678901234567890123456789012"
  },
  webhookUrl: "https://app.mediatorpro.com/api/webhooks/stripe",
  paymentMethods: ["card", "bank_transfer"],
  currency: "usd",
  autoCapture: true,
  statementDescriptor: "MediatorPro Services",
  statementDescriptorSuffix: "Mediation",
}

export default function StripeSettingsPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [config, setConfig] = useState(stripeConfig);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  
  // Helper for icon size
  const iconSizeClass = isMobile ? "h-3.5 w-3.5" : "h-4 w-4";
  
  // Simulates saving the Stripe settings
  const handleSave = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Settings saved",
        description: "Your Stripe integration settings have been updated.",
      });
    }, 1500);
  };
  
  // Handle mode change between test/live
  const handleModeChange = (mode) => {
    setConfig(prev => ({
      ...prev,
      mode
    }));
    
    toast({
      title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} mode activated`,
      description: mode === "live" 
        ? "Stripe is now processing live transactions. Real charges will be made." 
        : "Stripe is now in test mode. No real charges will be made.",
      variant: mode === "live" ? "destructive" : "default",
    });
  };
  
  // Handle payment method toggle
  const handlePaymentMethodToggle = (method) => {
    const updatedMethods = config.paymentMethods.includes(method)
      ? config.paymentMethods.filter(m => m !== method)
      : [...config.paymentMethods, method];
    
    setConfig(prev => ({
      ...prev,
      paymentMethods: updatedMethods
    }));
  };
  
  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold tracking-tight`}>Stripe Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure your Stripe integration for payment processing
          </p>
        </div>
      </div>
      
      <div className={`flex flex-wrap ${isMobile ? "gap-2" : "items-center"}`}>
        <Badge className={`${config.mode === "test" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"} ${isMobile ? "text-[0.65rem] h-5" : ""}`}>
          {config.mode === "test" ? "Test Mode" : "Live Mode"}
        </Badge>
        
        {config.connected && (
          <Badge className={`${isMobile ? "ml-1 text-[0.65rem] h-5" : "ml-2"} bg-green-100 text-green-800`}>
            <CheckCircle2 className={`${isMobile ? "mr-0.5 h-3 w-3" : "mr-1 h-3 w-3"}`} />
            Connected
          </Badge>
        )}
        
        <div className={`${isMobile ? "w-full mt-2" : "ml-auto"} flex gap-2`}>
          <Button
            variant={config.mode === "test" ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => handleModeChange("test")}
            className={isMobile ? "h-8 text-xs px-2.5" : ""}
          >
            Test Mode
          </Button>
          <Button
            variant={config.mode === "live" ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => handleModeChange("live")}
            className={isMobile ? "h-8 text-xs px-2.5" : ""}
          >
            Live Mode
          </Button>
        </div>
      </div>
      
      {config.mode === "live" && (
        <Alert variant="destructive" className={isMobile ? "py-2" : ""}>
          <AlertCircle className={iconSizeClass} />
          <AlertTitle className={isMobile ? "text-sm" : ""}>Warning: Live Mode Active</AlertTitle>
          <AlertDescription className={isMobile ? "text-xs" : ""}>
            Stripe is configured in live mode. Any transactions will process real payments and charge actual credit cards.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid grid-cols-3 ${isMobile ? "w-full text-xs" : "w-full sm:w-[400px]"}`}>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className={`${isMobile ? "space-y-3 mt-3" : "space-y-4 mt-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>General Settings</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Configure basic Stripe account settings
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
              <div className="space-y-2">
                <Label htmlFor="account-id" className={isMobile ? "text-sm" : ""}>Stripe Account ID</Label>
                <div className="flex">
                  <Input 
                    id="account-id" 
                    value={config.accountId}
                    readOnly
                    className={isMobile ? "h-8 text-sm" : ""}
                  />
                  <Button 
                    variant="outline" 
                    className={`ml-2 ${isMobile ? "h-8 text-xs px-2" : ""}`}
                    onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}
                  >
                    <ExternalLink className={`${isMobile ? "mr-1 h-3 w-3" : "h-4 w-4 mr-2"}`} />
                    {isMobile ? "View" : "Dashboard"}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency" className={isMobile ? "text-sm" : ""}>Default Currency</Label>
                <Select 
                  value={config.currency} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger id="currency" className={`w-full ${isMobile ? "h-8 text-sm" : ""}`}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="cad">CAD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="aud">AUD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className={isMobile ? "text-sm" : ""}>Payment Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className={iconSizeClass} />
                      <Label htmlFor="payment-card" className={`cursor-pointer ${isMobile ? "text-sm" : ""}`}>Credit/Debit Cards</Label>
                    </div>
                    <Switch 
                      id="payment-card" 
                      checked={config.paymentMethods.includes("card")}
                      onCheckedChange={() => handlePaymentMethodToggle("card")}
                      className={isMobile ? "h-4 w-7" : ""}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wallet className={iconSizeClass} />
                      <Label htmlFor="payment-bank" className={`cursor-pointer ${isMobile ? "text-sm" : ""}`}>Bank Transfers (ACH)</Label>
                    </div>
                    <Switch 
                      id="payment-bank" 
                      checked={config.paymentMethods.includes("bank_transfer")}
                      onCheckedChange={() => handlePaymentMethodToggle("bank_transfer")}
                      className={isMobile ? "h-4 w-7" : ""}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="auto-capture" className={isMobile ? "text-sm" : ""}>Auto-Capture Payments</Label>
                <div className="flex items-center justify-between">
                  <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                    Automatically capture authorized payments
                  </div>
                  <Switch 
                    id="auto-capture" 
                    checked={config.autoCapture}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoCapture: checked }))}
                    className={isMobile ? "h-4 w-7" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Statement Descriptor</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Set how your business appears on customer's credit card statements
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
              <div className="space-y-2">
                <Label htmlFor="statement-descriptor" className={isMobile ? "text-sm" : ""}>Descriptor</Label>
                <Input 
                  id="statement-descriptor" 
                  value={config.statementDescriptor}
                  onChange={(e) => setConfig(prev => ({ ...prev, statementDescriptor: e.target.value }))}
                  maxLength={22}
                  placeholder="Company Name"
                  className={isMobile ? "h-8 text-sm" : ""}
                />
                <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                  Maximum 22 characters. Cannot include special characters &lt;&gt;&# or % symbols.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statement-descriptor-suffix" className={isMobile ? "text-sm" : ""}>Descriptor Suffix</Label>
                <Input 
                  id="statement-descriptor-suffix" 
                  value={config.statementDescriptorSuffix}
                  onChange={(e) => setConfig(prev => ({ ...prev, statementDescriptorSuffix: e.target.value }))}
                  maxLength={12}
                  placeholder="Product"
                  className={isMobile ? "h-8 text-sm" : ""}
                />
                <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                  Maximum 12 characters. Shows after your business name.
                </p>
              </div>
              
              <div className={`${isMobile ? "mt-1.5 p-2" : "mt-2 p-3"} bg-muted rounded-md`}>
                <Label className={isMobile ? "text-xs" : ""}>Preview:</Label>
                <div className={`font-mono mt-1 ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>
                  {config.statementDescriptor} {config.statementDescriptorSuffix}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-keys" className={`${isMobile ? "space-y-3 mt-3" : "space-y-4 mt-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>API Keys</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Manage your Stripe API keys for {config.mode === "test" ? "test" : "live"} mode
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
              <div className="space-y-2">
                <Label htmlFor="publishable-key" className={isMobile ? "text-sm" : ""}>Publishable Key</Label>
                <div className="relative">
                  <Input 
                    id="publishable-key" 
                    value={config.publicKey[config.mode]}
                    readOnly
                    className={isMobile ? "h-8 text-xs pr-16" : ""}
                  />
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "sm" : "sm"}
                    className={`absolute right-1 top-1 ${isMobile ? "h-6 text-xs px-1.5" : "h-7"}`}
                    onClick={() => {
                      navigator.clipboard.writeText(config.publicKey[config.mode]);
                      toast({
                        title: "Copied to clipboard",
                        description: "Publishable key copied to clipboard.",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret-key" className={isMobile ? "text-sm" : ""}>Secret Key</Label>
                <div className="relative">
                  <Input 
                    id="secret-key" 
                    type={showSecretKey ? "text" : "password"}
                    value={config.secretKey[config.mode]}
                    readOnly
                    className={isMobile ? "h-8 text-xs pr-28" : ""}
                  />
                  <div className={`absolute right-1 top-1 flex ${isMobile ? "space-x-1" : ""}`}>
                    <Button 
                      variant="ghost" 
                      size={isMobile ? "sm" : "sm"}
                      className={isMobile ? "h-6 text-xs px-1.5" : "h-7"}
                      onClick={() => setShowSecretKey(prev => !prev)}
                    >
                      {showSecretKey ? "Hide" : "Show"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size={isMobile ? "sm" : "sm"}
                      className={isMobile ? "h-6 text-xs px-1.5" : "h-7"}
                      onClick={() => {
                        navigator.clipboard.writeText(config.secretKey[config.mode]);
                        toast({
                          title: "Copied to clipboard",
                          description: "Secret key copied to clipboard.",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <p className={`${isMobile ? "text-[0.65rem]" : "text-sm"} text-red-600 flex items-center mt-1`}>
                  <Lock className={`${isMobile ? "h-3 w-3 mr-0.5" : "h-4 w-4 mr-1"}`} />
                  Keep this key confidential. Never share your secret API key in public areas.
                </p>
              </div>
              
              <div className={`${isMobile ? "p-3 text-xs" : "p-4"} bg-muted rounded-md mt-2`}>
                <h4 className={`${isMobile ? "text-xs" : "text-sm"} font-medium mb-2`}>Need to rotate your API keys?</h4>
                <p className={`${isMobile ? "text-[0.65rem]" : "text-sm"} text-muted-foreground mb-3`}>
                  If your API keys have been compromised, you should rotate them immediately.
                </p>
                <Button variant="outline" className={`${isMobile ? "text-xs h-7 w-full" : "w-full sm:w-auto"}`}>
                  <Key className={`${isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2"}`} />
                  Rotate API Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks" className={`${isMobile ? "space-y-3 mt-3" : "space-y-4 mt-4"}`}>
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Webhook Configuration</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Configure webhooks to receive event notifications from Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-3 py-3" : ""} space-y-4`}>
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className={isMobile ? "text-sm" : ""}>Webhook URL</Label>
                <div className="relative">
                  <Input 
                    id="webhook-url" 
                    value={config.webhookUrl}
                    readOnly
                    className={isMobile ? "h-8 text-xs pr-16" : ""}
                  />
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "sm" : "sm"}
                    className={`absolute right-1 top-1 ${isMobile ? "h-6 text-xs px-1.5" : "h-7"}`}
                    onClick={() => {
                      navigator.clipboard.writeText(config.webhookUrl);
                      toast({
                        title: "Copied to clipboard",
                        description: "Webhook URL copied to clipboard.",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className={`${isMobile ? "text-[0.65rem]" : "text-xs"} text-muted-foreground`}>
                  Add this URL to your Stripe dashboard in the Webhooks section.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-secret" className={isMobile ? "text-sm" : ""}>Webhook Secret ({config.mode} mode)</Label>
                <div className="relative">
                  <Input 
                    id="webhook-secret" 
                    type={showWebhookSecret ? "text" : "password"}
                    value={config.webhookSecret[config.mode]}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      webhookSecret: {
                        ...prev.webhookSecret,
                        [config.mode]: e.target.value
                      }
                    }))}
                    className={isMobile ? "h-8 text-xs pr-16" : ""}
                  />
                  <Button 
                    variant="ghost" 
                    size={isMobile ? "sm" : "sm"}
                    className={`absolute right-1 top-1 ${isMobile ? "h-6 text-xs px-1.5" : "h-7"}`}
                    onClick={() => setShowWebhookSecret(prev => !prev)}
                  >
                    {showWebhookSecret ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
              
              <div className={`space-y-3 ${isMobile ? "pt-1" : "pt-2"}`}>
                <div className={isMobile ? "text-xs font-medium" : "text-sm font-medium"}>Events to Handle</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["payment_intent.succeeded", "payment_intent.payment_failed", "invoice.payment_succeeded", "invoice.payment_failed", "customer.subscription.created", "customer.subscription.updated"].map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <Switch 
                        id={`event-${event}`} 
                        defaultChecked 
                        className={isMobile ? "h-4 w-7" : ""}
                      />
                      <Label 
                        htmlFor={`event-${event}`} 
                        className={`${isMobile ? "text-xs" : "text-sm"} cursor-pointer`}
                      >
                        {event}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex mt-4">
                <Button 
                  variant="outline" 
                  className={isMobile ? "text-xs h-8" : ""}
                >
                  <Globe className={`${isMobile ? "h-3 w-3 mr-1.5" : "h-4 w-4 mr-2"}`} />
                  Test Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className={isMobile ? "px-3 py-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Recent Webhook Events</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Last 5 webhook events received
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-3 py-3" : ""}>
              <div className={`space-y-${isMobile ? "2" : "3"}`}>
                {[
                  { event: "payment_intent.succeeded", time: "Apr 26, 2025 14:32:11", status: "success" },
                  { event: "invoice.payment_succeeded", time: "Apr 26, 2025 10:15:47", status: "success" },
                  { event: "customer.subscription.updated", time: "Apr 25, 2025 09:27:08", status: "success" },
                  { event: "payment_intent.payment_failed", time: "Apr 24, 2025 16:42:19", status: "failed" },
                  { event: "payment_intent.succeeded", time: "Apr 24, 2025 11:54:36", status: "success" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between ${isMobile ? "p-1.5" : "p-2"} border rounded-md`}>
                    <div>
                      <div className={`font-mono ${isMobile ? "text-[0.65rem]" : "text-xs"}`}>{item.event}</div>
                      <div className={`${isMobile ? "text-[0.6rem]" : "text-xs"} text-muted-foreground`}>{item.time}</div>
                    </div>
                    <Badge 
                      className={`${item.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} ${isMobile ? "text-[0.65rem] px-1.5 py-0.5" : ""}`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className={`flex justify-end ${isMobile ? "mt-4" : ""}`}>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className={isMobile ? "h-8 text-xs" : ""}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">◌</span>
              Saving...
            </>
          ) : (
            <>
              <Save className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
              Save Settings
            </>
          )}
        </Button>
      </div>
      
      <Card>
        <CardHeader className={isMobile ? "px-3 py-3" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className={`grid gap-2 ${isMobile ? "px-3 pb-3 grid-cols-1" : "sm:grid-cols-2 md:grid-cols-3"}`}>
          <Button 
            variant="outline" 
            className={`justify-start ${isMobile ? "h-8 text-xs" : ""}`}
          >
            <CreditCard className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
            View Payment Methods
          </Button>
          <Button 
            variant="outline" 
            className={`justify-start ${isMobile ? "h-8 text-xs" : ""}`}
          >
            <ShieldCheck className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
            Security Settings
          </Button>
          <Button 
            variant="outline" 
            className={`justify-start ${isMobile ? "h-8 text-xs" : ""}`}
          >
            <ReceiptText className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
            View Transactions
          </Button>
          <Button 
            variant="outline" 
            className={`justify-start ${isMobile ? "h-8 text-xs" : ""}`}
          >
            <DollarSign className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
            Tax Settings
          </Button>
          <Button 
            variant="outline" 
            className={`justify-start ${isMobile ? "h-8 text-xs" : ""}`} 
            onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}
          >
            <ExternalLink className={`${isMobile ? "mr-1.5 h-3 w-3" : "mr-2 h-4 w-4"}`} />
            Open Stripe Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}