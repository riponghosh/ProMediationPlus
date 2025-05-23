// src/types/calendlyTypes.ts

export interface CalendlyUserResource {
  avatar_url: string | null;
  created_at: string;
  current_organization: string;
  email: string;
  name: string;
  scheduling_url: string;
  slug: string;
  timezone: string;
  updated_at: string;
  uri: string; // Very important for subsequent calls like fetching event types
}

export interface CalendlyEventTypeResource {
  active: boolean;
  color: string;
  created_at: string;
  description_html: string | null;
  description_plain: string | null;
  duration: number;
  internal_note: string | null;
  kind: string; // e.g., "solo"
  name: string;
  pooling_type: string | null;
  profile: {
    name: string;
    owner: string; // URI of the owner
    type: string; // e.g., "User"
  };
  scheduling_url: string;
  secret: boolean;
  slug: string;
  type: string; // e.g., "StandardEventType"
  updated_at: string;
  uri: string;
}

export interface CalendlyCollectionResponse<T> {
  collection: T[];
  pagination: {
    count: number;
    next_page: string | null;
    next_page_token: string | null;
    previous_page: string | null;
    previous_page_token: string | null;
  };
}