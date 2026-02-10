export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  location: string;
  organizer: string;
  images: {
    ogImage: string;
    heroImage: string;
    defaultEventImage: string;
  };
  social: {
    meetup?: string;
    linkedin?: string;
    luma?: string;
    sessionize?: string;
  };
}

export interface NavigationItem {
  name: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: NavigationItem[];
}

export interface Event {
  slug: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  location: string;
  locationUrl?: string;
  address: string;
  image: string;
  eventDetailImage?: string;
  content: string;
  speakers: Speaker[];
  sponsors: Sponsor[];
  registrationUrl?: string;
  attendees?: number;
  maxAttendees?: number;
  tags?: string[];
  isUpcoming: boolean;
  isPast: boolean;
}

export interface Speaker {
  name: string;
  topic: string;
  company?: string;
  bio?: string;
  image?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface Sponsor {
  slug: string;
  name: string;
  logo: string;
  url: string;
  tier: 'main' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'community';
  description: string;
  content: string;
  order?: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  content: string;
  tags: string[];
}

export interface AboutPage {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  content: string;
}

// Utility types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  image?: string;
  href?: string;
  external?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  external?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export interface NewsletterFormData {
  email: string;
  name?: string;
}

// SEO types
export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Analytics types
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Cache types
export interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate?: number;
  tags?: string[];
}
