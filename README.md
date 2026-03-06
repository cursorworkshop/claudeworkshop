# Claude Workshops

Professional AI-powered development training for engineering teams. Hands-on, intensive 5-day offsites in premium locations designed to transform experienced developers into Claude power-users.

## What We Offer

**Engineering Offsites & Professional Training**

- 5-day intensive Claude bootcamps in stunning Mediterranean locations
- Expert-led curriculum delivered by official Claude ambassadors
- Real-world AI implementation through hands-on coding sessions
- All-inclusive experience combining technical training with luxury accommodation
- Small group training (12-20 participants) for personalized attention

**Next Event: November 2025**

- Location: Kyrimai Hotel, Mani Peninsula, Greece
- Professional offsite for engineering teams
- Production-ready workflows and practical applications
- Mediterranean setting for focused learning and team bonding

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS with shadcn/ui components
- **Content Management:** Markdown-based CMS
- **UI Components:** shadcn/ui component library
- **Icons:** Lucide React
- **Font:** Inter (optimized with Next.js font system)

## Project Structure

```bash
claudeworkshop/
├── src/
│   ├── app/
│   │   ├── workshops/         # Workshop listings and detail pages
│   │   ├── about/            # About page and company information
│   │   ├── contact/          # Contact information
│   │   └── globals.css       # Global styles and CSS variables
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (Button, Card, etc.)
│   │   ├── Hero.tsx         # Homepage hero section
│   │   ├── Footer.tsx       # Site footer
│   │   └── ...              # Other custom components
│   └── lib/
│       ├── config.ts        # Site configuration
│       ├── markdown.ts      # Markdown processing utilities
│       └── types.ts         # TypeScript type definitions
├── content/
│   ├── workshops/           # Workshop content in markdown format
│   ├── about/              # About page content
│   └── sponsors/           # Sponsor information
├── public/
│   └── images/             # Static images and assets
└── components.json         # shadcn/ui configuration
```

## Development

**Prerequisites**

- Node.js 22+
- pnpm (recommended via Corepack)
- Git for version control

**Getting Started**

```bash
# Clone the repository
git clone [repository-url]
cd claudeworkshop

# Install dependencies
corepack enable
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

**Key Scripts**

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically

## Content Management

**Adding Workshops**
Create a new folder in `content/workshops/` with an `index.md` file:

```markdown
---
title: 'Claude Deep-Dive Workshop'
description: '5-day intensive bootcamp in Mediterranean setting'
date: '2025-11-09'
startTime: '09:00'
endTime: '17:00'
timezone: 'EET'
location: 'Kyrimai Hotel, Mani Peninsula, Greece'
image: '/images/workshops/banner.jpg'
registrationUrl: 'mailto:contact@example.com'
tags: ['Bootcamp', 'AI Development', 'Greece']
---

Workshop content goes here in markdown format.
```

## Design System

**Color Palette**

- Professional grayscale and neutral tones
- Minimal use of accent colors
- Corporate-appropriate styling throughout

**Typography**

- Primary font: Inter
- Clear hierarchy with proper heading structure
- Consistent spacing and sizing

**Components**

- Built with shadcn/ui for consistency
- Responsive design with mobile-first approach
- Clean, minimalist aesthetic

## Deployment

The site is optimized for deployment on modern hosting platforms:

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

Environment variables:

- Configure `NEXT_PUBLIC_SITE_URL` for your domain
- Update contact information in `src/lib/config.ts`

## Contact

For inquiries about Claude Workshops:

- Email: vasilis@vasilistsolis.com
- Email: contact@rogyr.com

---

Built for professional engineering teams seeking to master AI-powered development with Claude.
