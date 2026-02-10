import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

import { Event, Sponsor, AboutPage } from './types';

const contentDirectory = path.join(process.cwd(), 'content');

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkHtml).process(markdown);
  return result.toString();
}

export function getEventSlugs(): string[] {
  const eventsDir = fs.existsSync(path.join(contentDirectory, 'workshops'))
    ? path.join(contentDirectory, 'workshops')
    : path.join(contentDirectory, 'events');
  if (!fs.existsSync(eventsDir)) {
    return [];
  }

  const items = fs.readdirSync(eventsDir, { withFileTypes: true });
  const eventSlugs: string[] = [];

  for (const item of items) {
    if (item.isDirectory()) {
      // Check if the directory contains an index.md file
      const indexPath = path.join(eventsDir, item.name, 'index.md');
      if (fs.existsSync(indexPath)) {
        eventSlugs.push(item.name);
      }
    } else if (item.isFile() && item.name.endsWith('.md')) {
      // Handle legacy .md files directly in events directory
      eventSlugs.push(item.name.replace(/\.md$/, ''));
    }
  }

  return eventSlugs;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const realSlug = slug.replace(/\.md$/, '');

  // Try workshops folder first (index.md inside folder)
  let fullPath = path.join(contentDirectory, 'workshops', realSlug, 'index.md');

  if (!fs.existsSync(fullPath)) {
    // Direct .md file in workshops
    fullPath = path.join(contentDirectory, 'workshops', `${realSlug}.md`);
  }
  if (!fs.existsSync(fullPath)) {
    // Legacy events folder structure (index.md)
    fullPath = path.join(contentDirectory, 'events', realSlug, 'index.md');
  }
  if (!fs.existsSync(fullPath)) {
    // Legacy direct .md in events
    fullPath = path.join(contentDirectory, 'events', `${realSlug}.md`);
  }
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const htmlContent = await markdownToHtml(content);

  return {
    slug: realSlug,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    startTime: data.startTime || '',
    endTime: data.endTime,
    timezone: data.timezone,
    location: data.location || '',
    locationUrl: data.locationUrl,
    address: data.address || '',
    image: data.image || '',
    eventDetailImage: data.eventDetailImage,
    content: htmlContent,
    speakers: data.speakers || [],
    sponsors: data.sponsors || [],
    registrationUrl: data.registrationUrl,
    attendees: data.attendees,
    maxAttendees: data.maxAttendees,
    tags: data.tags || [],
    isUpcoming: new Date(data.date) >= new Date(),
    isPast: new Date(data.date) < new Date(),
  };
}

export async function getAllEvents(): Promise<Event[]> {
  const slugs = getEventSlugs();
  const events = await Promise.all(slugs.map(slug => getEventBySlug(slug)));

  return events
    .filter((event): event is Event => event !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const allEvents = await getAllEvents();
  const now = new Date();

  return allEvents.filter(event => new Date(event.date) >= now);
}

export async function getPastEvents(): Promise<Event[]> {
  const allEvents = await getAllEvents();
  const now = new Date();

  return allEvents
    .filter(event => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getSponsorSlugs(): string[] {
  const sponsorsDir = path.join(contentDirectory, 'sponsors');
  if (!fs.existsSync(sponsorsDir)) {
    return [];
  }
  return fs.readdirSync(sponsorsDir).filter(name => name.endsWith('.md'));
}

export async function getSponsorBySlug(slug: string): Promise<Sponsor | null> {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(contentDirectory, 'sponsors', `${realSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const htmlContent = await markdownToHtml(content);

  return {
    slug: realSlug,
    name: data.name || '',
    tier: data.tier || 'community',
    logo: data.logo || '',
    url: data.website || '',
    description: data.description || '',
    content: htmlContent,
    order: data.order ?? 999,
  };
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  const slugs = getSponsorSlugs();
  const sponsors = await Promise.all(slugs.map(slug => getSponsorBySlug(slug)));

  return sponsors
    .filter((sponsor): sponsor is Sponsor => sponsor !== null)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}

export function getAboutSlugs(): string[] {
  const aboutDir = path.join(contentDirectory, 'about');
  if (!fs.existsSync(aboutDir)) {
    return [];
  }
  return fs.readdirSync(aboutDir).filter(name => name.endsWith('.md'));
}

export async function getAboutBySlug(slug: string): Promise<AboutPage | null> {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(contentDirectory, 'about', `${realSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const htmlContent = await markdownToHtml(content);

  return {
    slug: realSlug,
    title: data.title || '',
    description: data.description || '',
    lastUpdated: data.lastUpdated || '',
    content: htmlContent,
  };
}
