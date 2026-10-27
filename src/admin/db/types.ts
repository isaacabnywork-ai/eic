/**
 * Equip Indian Churches - Custom Admin Data Types
 * Strict isolation: All entities defined here belong to the independent admin system.
 */

export type AdminRole = 'super_admin' | 'administrator' | 'event_manager' | 'editor' | 'read_only';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = 'published' | 'draft' | 'private' | 'scheduled' | 'archived' | 'trash';

export type EventOperationalStatus = 'scheduled' | 'rescheduled' | 'postponed' | 'cancelled' | 'moved_online';

export interface EventScheduleSession {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  speakerIds: string[];
  displayOrder: number;
}

export interface EventFaqItem {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface CustomEvent {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  featuredPosterUrl: string;
  galleryImageUrls: string[];
  
  status: EventStatus;
  operationalStatus: EventOperationalStatus;
  
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string;   // YYYY-MM-DD
  endTime: string;   // HH:mm
  isAllDay: boolean;
  hideEndTime: boolean;
  timezone: string;  // e.g. 'Asia/Kolkata'

  // Recurrence
  isRecurring: boolean;
  recurrenceRule?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceEndDate?: string;

  // Venue & Location
  venueId?: string;
  customVenueName?: string;
  customVenueAddress?: string;
  isOnlineOnly: boolean;
  onlineJoinUrl?: string;

  // People
  speakerIds: string[];
  organizerIds: string[];
  categoryIds: string[];
  tagIds: string[];

  // Registration & Links
  registrationUrl: string;
  registrationButtonLabel: string;
  registrationAvailable: boolean;
  externalInfoUrl?: string;
  promotionalVideoUrl?: string;

  // Pricing
  isFree: boolean;
  price?: number;
  currency: string;       // Default 'INR'
  currencySymbol: string; // Default '₹'

  // Sessions Agenda & FAQs
  schedules: EventScheduleSession[];
  faqs: EventFaqItem[];

  // SEO & Social Meta
  seoTitle?: string;
  metaDescription?: string;
  socialSharingImageUrl?: string;

  // Audit
  createdById: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  colorHex: string;
  displayOrder: number;
  createdAt: string;
}

export interface EventTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Speaker {
  id: string;
  name: string;
  slug: string;
  photoUrl?: string;
  biography: string;
  designation: string;
  organization: string;
  websiteUrl?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialYoutube?: string;
  displayOrder: number;
  createdAt: string;
}

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  displayOrder: number;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  mapUrl?: string;
  capacity?: number;
  createdAt: string;
}

export interface CustomMenuItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  isEnabled: boolean;
  displayOrder: number;
  parentId?: string | null;
  children?: CustomMenuItem[];
}

export interface CustomMenuConfig {
  id: 'header_menu' | 'footer_menu';
  name: string;
  updatedAt: string;
  updatedBy: string;
  items: CustomMenuItem[];
}

export interface CustomFooterGroup {
  id: string;
  heading: string;
  displayOrder: number;
  links: {
    id: string;
    label: string;
    url: string;
    target: '_self' | '_blank';
    isEnabled: boolean;
    displayOrder: number;
  }[];
}

export interface CustomFooterMenuConfig {
  id: 'footer_menu_config';
  updatedAt: string;
  updatedBy: string;
  groups: CustomFooterGroup[];
}

export interface ApplicationSettings {
  defaultTimezone: string;
  defaultCurrency: string;
  defaultCurrencySymbol: string;
  defaultRegistrationLabel: string;
  supportEmail: string;
  eventsPerPage: number;
  enablePublicCustomEvents: boolean;
  enablePublicCustomMenus: boolean;
  autoArchivePastEvents: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface MediaRecord {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  width?: number;
  height?: number;
  uploadedById: string;
  uploadedByEmail: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;      // e.g. 'event.create', 'event.publish', 'menu.update', 'user.login'
  entity: string;      // e.g. 'event', 'category', 'menu', 'setting', 'user'
  entityId?: string;
  entityTitle?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}
