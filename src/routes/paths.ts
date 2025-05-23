// Define all application routes for better organization and maintenance
export const paths = {
  root: '/',
  calendar: '/calendar',
  email: '/email',
  caseFiles: '/case-files',
  tasks: '/tasks',
  contacts: '/contacts',
  billing: '/billing',
  documents: '/documents',
  reports: '/reports',
  settings: '/settings',
  notes: '/notes',
  templates: '/templates',
  storage: '/storage',
  forms: '/forms',
  guides: '/guides',
  guidesGettingStarted: '/guides/getting-started',
  guidesBusinessSetUp: '/guides/business-set-up',
  guidesGrowYourBusiness: '/guides/grow-your-business',
  guidesMediateSuccess: '/guides/mediate-success',
  
  // Admin section paths
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    
    // User Management - consolidated into single path
    users: '/admin/users',
    
    // Case/Data Oversight
    allCases: '/admin/cases/all',
    importExport: '/admin/data/import-export',
    
    // Content & Configuration
    templates: '/admin/content/templates',
    guides: '/admin/content/guides',
    
    // Monitoring & Logs
    auditLog: '/admin/monitoring/audit-log',
    systemStatus: '/admin/monitoring/system-status',
    
    // Integrations
    hubspot: '/admin/hubspot',
    openai: '/admin/openai',
    stripeSettings: '/admin/billing/stripe-settings',
    
    // Billing & Subscriptions
    plans: '/admin/billing/plans',
    subscriptions: '/admin/billing/subscriptions',
    invoices: '/admin/billing/invoices',

    
    // General Settings
    settings: '/admin/settings',
  },
};

export default paths;