# API Specifications

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: ✅ Implemented

## 🎯 Overview

The Claude Workshop website uses a file-based API approach with markdown content management. This document specifies the data structures, content formats, and utility functions for content processing.

## 📁 Content API

### Markdown Processing

**File**: `src/lib/markdown.ts`  
**Status**: ✅ Implemented

#### Core Functions

```typescript
// Parse markdown content with front matter
export function parseMarkdown(content: string): {
  data: Record<string, any>;
  content: string;
};

// Get all events from content directory
export function getAllEvents(): Event[];

// Get upcoming events
export function getUpcomingEvents(): Event[];

// Get past events
export function getPastEvents(): Event[];

// Get event by slug
export function getEventBySlug(slug: string): Event | null;

// Get all sponsors
export function getAllSponsors(): Sponsor[];

// Get about page content
export function getAboutContent(): AboutPage;
```

#### Content Structure

```typescript
// Event content structure
interface EventContent {
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  location: string;
  locationUrl?: string;
  description: string;
  image: string;
  published: boolean;
  attendees?: number;
  maxAttendees?: number;
  registrationUrl?: string;
  tags?: string[];
  speakers: Speaker[];
  sponsors: Sponsor[];
}
```

### Content Directory Structure

```
content/
├── events/
│   └── [event-slug]/
│       ├── index.md          # Event content
│       └── images/           # Event images
├── sponsors/
│   ├── claude.md            # Sponsor content
│   └── [sponsor-slug].md    # Additional sponsors
└── about/
    ├── description.md        # About page content
    ├── founder.md           # Founder profile
    └── code-of-conduct.md   # Community guidelines
```

## 🎯 Type Definitions

### Core Types

**File**: `src/lib/types.ts`  
**Status**: ✅ Implemented

#### Event Interface

```typescript
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
```

#### Speaker Interface

```typescript
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
```

#### Sponsor Interface

```typescript
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
```

#### Site Configuration

```typescript
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
```

## 🔧 Utility Functions

### Content Processing

**File**: `src/lib/utils.ts`  
**Status**: ✅ Implemented

#### Date Utilities

```typescript
// Format date for display
export function formatDate(date: string): string;

// Check if event is upcoming
export function isUpcomingEvent(date: string): boolean;

// Get relative time (e.g., "2 days ago")
export function getRelativeTime(date: string): string;
```

#### URL Utilities

```typescript
// Generate event URL
export function getEventUrl(slug: string): string;

// Validate external URLs
export function isValidUrl(url: string): boolean;

// Sanitize URL for display
export function sanitizeUrl(url: string): string;
```

#### Content Utilities

```typescript
// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string;

// Extract first paragraph from markdown
export function extractFirstParagraph(content: string): string;

// Generate slug from title
export function generateSlug(title: string): string;
```

## 📝 Content Format Specifications

### Event Markdown Format

```markdown
---
title: 'Event Title'
date: '2025-01-15'
startTime: '18:30'
endTime: '21:00'
timezone: 'CEST'
location: 'Global'
locationUrl: 'https://maps.google.com/...'
description: 'Brief event description'
image: '/images/events/event-image.jpg'
published: true
attendees: 0
maxAttendees: 50
registrationUrl: 'https://meetup.com/...'
tags: ['AI', 'Development', 'Claude Code']
speakers:
  - name: 'Speaker Name'
    topic: 'Talk Title'
    company: 'Company Name'
    bio: 'Speaker bio'
    image: '/images/speakers/speaker.jpg'
    social:
      twitter: '@speaker'
      linkedin: 'linkedin.com/in/speaker'
      github: 'github.com/speaker'
sponsors:
  - slug: 'claude'
    tier: 'main'
---

Full event description in markdown...
```

### Sponsor Markdown Format

```markdown
---
name: 'Sponsor Name'
tier: 'main' # main, platinum, gold, silver, bronze, community
logo: '/images/sponsors/sponsor-logo.png'
website: 'https://sponsor.com'
description: 'Brief description'
featured: true
order: 1
---

Full sponsor description...
```

### About Page Format

```markdown
---
title: 'About Claude Workshop'
description: 'Community description'
lastUpdated: '2025-01-01'
---

Page content in markdown...
```

## 🔍 SEO API

### Metadata Generation

**File**: `src/lib/seo.ts`  
**Status**: ✅ Implemented

#### SEO Functions

```typescript
// Generate metadata for pages
export function generateMetadata(params: SeoProps): Metadata;

// Generate Open Graph tags
export function generateOpenGraph(params: SeoProps): OpenGraph;

// Generate Twitter Card metadata
export function generateTwitterCard(params: SeoProps): TwitterCard;

// Generate structured data for events
export function generateEventStructuredData(event: Event): string;
```

#### SEO Types

```typescript
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
```

## 🎯 Configuration API

### Site Configuration

**File**: `src/lib/config.ts`  
**Status**: ✅ Implemented

#### Configuration Structure

```typescript
export const siteConfig: SiteConfig = {
  title: 'Claude Workshop',
  description:
    'The community for builders, creators, and curious minds shaping the future with AI globally',
  url: 'https://claudeworkshop.com',
  location: 'Global',
  organizer: 'Luca Bianchi',
  images: {
    ogImage: '/images/claude_milano_square.jpg',
    heroImage: '/images/claude_milano_landscape.jpg',
    defaultEventImage: '/images/meetup_20250916.jpg',
  },
  social: {
    meetup: 'https://www.meetup.com/claude-workshop/',
    linkedin: 'https://linkedin.com/company/claude-workshop',
    luma: 'https://lu.ma/claude-milano-settembre',
    sessionize: 'https://sessionize.com/claude-workshop',
  },
};
```

#### Navigation Configuration

```typescript
export const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'About', href: '/about' },
  { name: 'Speakers', href: '/speakers' },
  { name: 'Sponsors', href: '/sponsors' },
];
```

## 🔄 Data Flow

### Content Processing Flow

```
1. Markdown Files (content/)
   ↓
2. Gray Matter Parsing (front matter + content)
   ↓
3. Type Validation (TypeScript interfaces)
   ↓
4. Data Transformation (utils.ts)
   ↓
5. Component Rendering (React components)
```

### Event Processing Flow

```
1. getAllEvents() → Read all event files
   ↓
2. parseMarkdown() → Parse front matter
   ↓
3. validateEvent() → Type checking
   ↓
4. processEvent() → Add computed fields
   ↓
5. sortEvents() → Sort by date
   ↓
6. filterEvents() → Separate upcoming/past
```

## 🧪 Testing API

### Content Testing

```typescript
// Test markdown parsing
describe('markdown parsing', () => {
  it('parses front matter correctly', () => {
    const content = `---
title: Test Event
date: 2025-01-15
---
Content here`;

    const result = parseMarkdown(content);
    expect(result.data.title).toBe('Test Event');
    expect(result.data.date).toBe('2025-01-15');
  });
});

// Test event processing
describe('event processing', () => {
  it('filters upcoming events correctly', () => {
    const events = getAllEvents();
    const upcoming = getUpcomingEvents();

    expect(upcoming.every(event => isUpcomingEvent(event.date))).toBe(true);
  });
});
```

## 🔒 Security Considerations

### Input Validation

```typescript
// Validate event data
export function validateEvent(event: any): Event {
  if (!event.title || !event.date) {
    throw new Error('Invalid event data');
  }

  return {
    ...event,
    slug: generateSlug(event.title),
    isUpcoming: isUpcomingEvent(event.date),
    isPast: !isUpcomingEvent(event.date),
  };
}

// Sanitize markdown content
export function sanitizeMarkdown(content: string): string {
  // Remove potentially dangerous HTML
  return content.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
}
```

### URL Validation

```typescript
// Validate external URLs
export function validateExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}
```

## 📊 Performance Considerations

### Caching Strategy

```typescript
// Cache parsed content
const contentCache = new Map<string, any>();

export function getCachedContent(key: string): any {
  if (contentCache.has(key)) {
    return contentCache.get(key);
  }

  const content = parseContent(key);
  contentCache.set(key, content);
  return content;
}
```

### Lazy Loading

```typescript
// Lazy load event images
export function getOptimizedEventImage(event: Event): string {
  return event.image || siteConfig.images.defaultEventImage;
}
```

## 📋 API Checklist

### Implementation Status

- [x] Markdown parsing utilities
- [x] Event content processing
- [x] Sponsor content processing
- [x] About page content processing
- [x] SEO metadata generation
- [x] Site configuration system
- [x] Navigation configuration
- [x] Type definitions
- [x] Utility functions
- [x] Content validation
- [x] Security measures
- [x] Performance optimization
- [x] Testing coverage

### Quality Assurance

- [x] TypeScript interfaces defined
- [x] Input validation implemented
- [x] Error handling included
- [x] Performance optimization applied
- [x] Security measures implemented
- [x] Testing coverage established
- [x] Documentation completed
