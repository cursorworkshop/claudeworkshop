import { SiteConfig } from './types';

export const siteConfig: SiteConfig = {
  title: 'Claude Workshop',
  description: 'Professional Claude Code training for engineering teams',
  url: 'https://claudeworkshop.com',
  location: 'Global',
  organizer: 'Claude Workshop',
  images: {
    ogImage: '/images/og-image-figma.png',
    heroImage: '/images/hotel_ambiance_mustinclude.jpg',
    defaultEventImage: '/images/hotel_ambiance_mustinclude.jpg',
  },
  social: {
    meetup: 'https://www.meetup.com/claude-workshop/',
    linkedin: 'https://www.linkedin.com/in/rogyr/',
    luma: 'https://lu.ma/claude-milano-settembre', // Updated with actual Lu.ma event
    sessionize: 'https://sessionize.com/claude-workshop', // Update with actual Sessionize
  },
};

export const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Training', href: '/training' },
  // { name: 'Research', href: '/research' }, // Hidden: content needs rewriting
  { name: 'Methodology', href: '/methodology' },
  { name: 'About', href: '/about' },
];

export const footerLinks = {
  community: [],
  about: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
  ],
  resources: [
    { name: 'Claude Code', href: 'https://claude.ai' },
    { name: 'Training', href: '/training' },
  ],
};
