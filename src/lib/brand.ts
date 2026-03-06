export type BrandKey = 'cursor' | 'claude' | 'codex';

export type BrandLogoConfig =
  | {
      variant: 'cursor-cube';
      alt: string;
    }
  | {
      variant: 'image';
      alt: string;
      src: string;
      width: number;
      height: number;
    };

export type BrandConfig = {
  key: BrandKey;
  productName: string;
  workshopName: string;
  workshopsName: string;
  domain: string;
  siteUrl: string;
  favicon: string;
  infoEmail: string;
  privacyEmail: string;
  calUrl: string;
  calDisplayUrl: string;
  lumaUrl: string;
  lumaDisplayUrl: string;
  githubOrgUrl: string;
  githubRepoName: string;
  githubRepoUrl: string;
  logo: BrandLogoConfig;
};

const DEFAULT_BRAND_KEY: BrandKey = 'claude';
const CODEX_LOGO_BLACK_URL = '/images/brands/codex-logo-black.png?v=20260306b';

const BRANDS: Record<BrandKey, BrandConfig> = {
  cursor: {
    key: 'cursor',
    productName: 'Claude',
    workshopName: 'Claude Workshop',
    workshopsName: 'Claude Workshops',
    domain: 'claudeworkshop.com',
    siteUrl: 'https://claudeworkshop.com',
    favicon: '/favicon.svg',
    infoEmail: 'info@claudeworkshop.com',
    privacyEmail: 'privacy@claudeworkshop.com',
    calUrl: 'https://cal.com/claudeworkshop',
    calDisplayUrl: 'cal.com/claudeworkshop',
    lumaUrl: 'https://luma.com/user/rogyr',
    lumaDisplayUrl: 'luma.com/user/rogyr',
    githubOrgUrl: 'https://github.com/cursorworkshop',
    githubRepoName: 'cursorworkshop',
    githubRepoUrl: 'https://github.com/cursorworkshop/claudeworkshop',
    logo: {
      variant: 'cursor-cube',
      alt: 'Claude Workshop logo',
    },
  },
  claude: {
    key: 'claude',
    productName: 'Claude',
    workshopName: 'Claude Workshop',
    workshopsName: 'Claude Workshops',
    domain: 'claudeworkshop.com',
    siteUrl: 'https://claudeworkshop.com',
    favicon: '/images/brands/claude-logo.png',
    infoEmail: 'info@claudeworkshop.com',
    privacyEmail: 'privacy@claudeworkshop.com',
    calUrl: 'https://cal.com/claudeworkshop',
    calDisplayUrl: 'cal.com/claudeworkshop',
    lumaUrl: 'https://luma.com/user/rogyr',
    lumaDisplayUrl: 'luma.com/user/rogyr',
    githubOrgUrl: 'https://github.com/cursorworkshop',
    githubRepoName: 'claudeworkshop',
    githubRepoUrl: 'https://github.com/cursorworkshop/claudeworkshop',
    logo: {
      variant: 'image',
      alt: 'Claude Workshop logo',
      src: '/images/brands/claude-logo.png',
      width: 96,
      height: 96,
    },
  },
  codex: {
    key: 'codex',
    productName: 'Codex',
    workshopName: 'Codex Workshop',
    workshopsName: 'Codex Workshops',
    domain: 'codexworkshop.com',
    siteUrl: 'https://codexworkshop.com',
    favicon: CODEX_LOGO_BLACK_URL,
    infoEmail: 'info@codexworkshop.com',
    privacyEmail: 'privacy@codexworkshop.com',
    calUrl: 'https://cal.com/codexworkshop',
    calDisplayUrl: 'cal.com/codexworkshop',
    lumaUrl: 'https://luma.com/user/rogyr',
    lumaDisplayUrl: 'luma.com/user/rogyr',
    githubOrgUrl: 'https://github.com/cursorworkshop',
    githubRepoName: 'codexworkshop',
    githubRepoUrl: 'https://github.com/cursorworkshop/codexworkshop',
    logo: {
      variant: 'image',
      alt: 'Codex Workshop logo',
      src: CODEX_LOGO_BLACK_URL,
      width: 96,
      height: 96,
    },
  },
};

export const brandConfig = BRANDS[DEFAULT_BRAND_KEY];
