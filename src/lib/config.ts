import { brandConfig } from './brand';
import { SiteConfig } from './types';

export const siteConfig: SiteConfig = {
  title: brandConfig.workshopName,
  description: `Professional ${brandConfig.productName} training for engineering teams`,
  url: brandConfig.siteUrl,
  location: 'Global',
  organizer: brandConfig.workshopName,
  branding: {
    key: brandConfig.key,
    productName: brandConfig.productName,
    workshopName: brandConfig.workshopName,
    workshopsName: brandConfig.workshopsName,
    domain: brandConfig.domain,
    favicon: brandConfig.favicon,
  },
  contact: {
    infoEmail: brandConfig.infoEmail,
    privacyEmail: brandConfig.privacyEmail,
    notificationRecipients: [
      'vasilis@vasilistsolis.com',
      'contact@rogyr.com',
      brandConfig.infoEmail,
    ],
    replyForwardRecipients: ['contact@rogyr.com', 'vasilis@vasilistsolis.com'],
  },
  bookings: {
    callUrl: brandConfig.calUrl,
    callDisplayUrl: brandConfig.calDisplayUrl,
    lumaUrl: brandConfig.lumaUrl,
    lumaDisplayUrl: brandConfig.lumaDisplayUrl,
  },
  github: {
    orgUrl: brandConfig.githubOrgUrl,
    repoName: brandConfig.githubRepoName,
    repoUrl: brandConfig.githubRepoUrl,
  },
  images: {
    ogImage: '/images/og-image-figma.png',
    heroImage: '/images/hotel_ambiance_mustinclude.jpg',
    defaultEventImage: '/images/hotel_ambiance_mustinclude.jpg',
  },
  social: {
    meetup: 'https://www.meetup.com/cursor-workshop/',
    linkedin: 'https://www.linkedin.com/in/rogyr/',
    luma: 'https://lu.ma/cursor-milano-settembre', // Updated with actual Lu.ma event
    sessionize: 'https://sessionize.com/cursor-workshop', // Update with actual Sessionize
  },
};

export const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Training', href: '/training' },
  { name: 'Research', href: '/research' },
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
    { name: 'Claude', href: 'https://cursor.sh' },
    { name: 'Training', href: '/training' },
  ],
};
