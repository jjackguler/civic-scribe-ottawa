// Civic signals database types (prepared for Supabase migration)

export type SignalType =
  | "citizen-report" | "breaking-news" | "traffic" | "transit" | "weather-alert"
  | "food" | "sports" | "event" | "public-safety" | "good-news"
  | "fact-check" | "unresolved" | "solved"
  // Phase: ingestion expansion
  | "open-issue" | "road-closure" | "parks-alert" | "health-recall" | "school-closure";

export type SignalUrgency = "low" | "medium" | "high" | "critical";

export type SignalVerification =
  | "verified" | "developing" | "community-submitted"
  | "needs-fact-check" | "official-source" | "editor-reviewed";

export type SignalSourceType = "editorial" | "citizen" | "official" | "rss-external" | "ai-assisted";

/**
 * Trauma-informed safety classification. Items tagged with any of the
 * "hold_for_editor"-equivalent classes must NOT be auto-published.
 */
export type SafetyClassification =
  | "routine_public_notice"
  | "traffic_or_closure"
  | "public_health_alert"
  | "weather_or_environment_alert"
  | "school_closure_official"
  | "police_release_sensitive"
  | "involves_minor"
  | "involves_victim"
  | "involves_suspect"
  | "violent_crime"
  | "homicide_or_death"
  | "sexual_violence"
  | "domestic_violence"
  | "missing_person"
  | "active_investigation"
  | "court_or_publication_ban_risk"
  | "hold_for_editor";

export type PublishStatus =
  | "auto_published"
  | "hold_for_editor"
  | "editor_approved"
  | "editor_rejected"
  | "expired";

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
  source_group?: string;
  safety_classifications?: SafetyClassification[];
  publish_status?: PublishStatus;
  image_url?: string;
  image_alt?: string;
  image_consent_status?: "owner-confirmed" | "cc-licensed" | "ai-generated" | "editorial-stock";
  related_story_ids?: string[];
  editor_notes?: string;
  community_action_steps?: string[];
  // 311 Open Issues lifecycle
  issue_status?: "reported" | "acknowledged" | "in_progress" | "resolved";
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

export type SourceStatus =
  | "working" | "discovered" | "failed" | "manual_config_required" | "disabled";

export interface SourceConfig {
  id: string;
  group: string;
  name: string;
  url: string;
  discovered_url?: string;
  status: SourceStatus;
  enabled: boolean;
  refresh_interval_minutes: number;
  last_sync_at?: string;
  next_sync_at?: string;
  notes?: string;
  sensitive_items_pending?: number;
}
