// Civic signals database types (prepared for Supabase migration)

export type SignalType =
  | "citizen-report" | "breaking-news" | "traffic" | "transit" | "weather-alert"
  | "food" | "sports" | "event" | "public-safety" | "good-news"
  | "fact-check" | "unresolved" | "solved";

export type SignalUrgency = "low" | "medium" | "high" | "critical";

export type SignalVerification =
  | "verified" | "developing" | "community-submitted"
  | "needs-fact-check" | "official-source" | "editor-reviewed";

export type SignalSourceType = "editorial" | "citizen" | "official" | "rss-external" | "ai-assisted";

export interface MapSignal {
  id: string;
  type: SignalType;
  title: string;
  summary: string;
  lat: number;
  lng: number;
  neighborhood: string;
  urgency: SignalUrgency;
  verification: SignalVerification;
  source_type: SignalSourceType;
  source_url?: string;
  source_name?: string;
  image_url?: string;
  image_alt?: string;
  image_consent_status?: "owner-confirmed" | "cc-licensed" | "ai-generated" | "editorial-stock";
  related_story_ids?: string[];
  editor_notes?: string;
  community_action_steps?: string[];
  created_at: string;
  updated_at: string;
  expires_at?: string;
  language: "en" | "fr" | "both";
}

export interface CitizenReport {
  id: string;
  signal_id: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_consent_contact: boolean;
  location_precision: "exact" | "approximate" | "neighborhood-only";
  social_links?: {
    instagram?: string; tiktok?: string; twitter?: string;
    facebook?: string; youtube?: string; reddit?: string;
  };
  uploaded_media_ids?: string[];
  media_ownership_confirmed: boolean;
  consent_to_publish: boolean;
  status: "submitted" | "auto-checked" | "in-review" | "approved" | "needs-info" | "rejected" | "on-hold";
  editor_reviewer_id?: string;
  rejection_reason?: string;
  ip_hash?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface EditorialReview {
  id: string;
  signal_id: string;
  editor_id: string;
  action: "approve" | "reject" | "request-info" | "hold" | "edit";
  notes: string;
  fact_checks_performed: string[];
  sources_verified: string[];
  decision_at: string;
}
