# Component Specifications

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: ✅ Implemented

## 🎯 Overview

This document specifies all components implemented in the Claude Workshop website, including their props, behavior, and usage patterns.

## 🏗️ Component Architecture

### Component Hierarchy

```
App Layout
├── Header
│   ├── Navigation
│   └── Mobile Menu
├── Page Content
│   ├── Hero (Homepage)
│   ├── EventCard (Events)
│   ├── SponsorGrid (Sponsors)
│   └── Content Sections
└── Footer
    ├── Social Links
    ├── Navigation Links
    └── Copyright
```

## 📦 Core Components

### Header Component

**File**: `src/components/Header.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface HeaderProps {
  className?: string;
}
```

#### Features

- **Responsive Navigation**: Desktop and mobile layouts
- **Active Page Highlighting**: Current page indication
- **Mobile Menu**: Hamburger menu for mobile devices
- **External Link Handling**: Proper link attributes
- **Accessibility**: ARIA labels and keyboard navigation

#### Usage

```tsx
<Header />
```

#### Implementation Details

- Uses Next.js Link component for internal navigation
- Implements responsive design with Tailwind CSS
- Includes proper accessibility attributes
- Handles mobile menu state with React hooks

### Footer Component

**File**: `src/components/Footer.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface FooterProps {
  className?: string;
}
```

#### Features

- **Social Links**: Meetup, LinkedIn, Lu.ma, Sessionize
- **Navigation Links**: About, Code of Conduct, Founder, Contact
- **Resource Links**: Claude Code, Learning Resources
- **Responsive Layout**: Mobile-first design
- **Brand Consistency**: Milano-inspired styling

#### Usage

```tsx
<Footer />
```

#### Implementation Details

- Organized link sections with proper grouping
- External links open in new tabs
- Consistent styling with site theme
- Proper semantic HTML structure

### Hero Component

**File**: `src/components/Hero.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface HeroProps {
  title?: string;
  description?: string;
  image?: string;
  className?: string;
}
```

#### Features

- **Milano Gradient Background**: Custom gradient design
- **Community Statistics**: Member count and event info
- **Call-to-Action Buttons**: Join community and view events
- **Responsive Design**: Mobile-optimized layout
- **SEO Optimized**: Proper heading structure

#### Usage

```tsx
<Hero
  title='Welcome to Claude Workshop'
  description='The community for AI-powered development in Milano'
/>
```

#### Implementation Details

- Uses Next.js Image component for optimization
- Implements gradient overlay for text readability
- Includes proper semantic HTML structure
- Optimized for Core Web Vitals

### EventCard Component

**File**: `src/components/EventCard.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface EventCardProps {
  event: Event;
  className?: string;
  variant?: 'default' | 'featured' | 'compact';
}
```

#### Features

- **Event Information Display**: Title, date, location, description
- **Speaker Information**: Speaker names and topics
- **Registration Links**: Direct links to event registration
- **Status Indicators**: Upcoming/past event status
- **Tag System**: Event categorization
- **Responsive Design**: Mobile-optimized cards

#### Usage

```tsx
<EventCard event={eventData} variant='featured' />
```

#### Implementation Details

- Handles missing event data gracefully
- Implements proper date formatting
- Uses conditional rendering for optional fields
- Includes hover effects and transitions

### SponsorGrid Component

**File**: `src/components/SponsorGrid.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface SponsorGridProps {
  sponsors: Sponsor[];
  className?: string;
  showTiers?: boolean;
}
```

#### Features

- **Tier System**: Main, platinum, gold, silver, bronze, community
- **Logo Display**: Optimized sponsor logos
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Link Integration**: Sponsor website links
- **Description Support**: Sponsor descriptions and content

#### Usage

```tsx
<SponsorGrid sponsors={sponsorData} showTiers={true} />
```

#### Implementation Details

- Groups sponsors by tier for organized display
- Implements responsive grid with Tailwind CSS
- Handles missing sponsor data gracefully
- Uses Next.js Image for logo optimization

## 🎨 UI Components

### Button Component

**File**: `src/components/ui/Button.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  external?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}
```

#### Variants

- **Primary**: Blue background with white text
- **Secondary**: Gray background with dark text
- **Outline**: Transparent with border
- **Ghost**: Transparent with hover effects

#### Sizes

- **Small**: Compact button for tight spaces
- **Medium**: Standard button size
- **Large**: Prominent button for CTAs

#### Usage

```tsx
<Button variant='primary' size='lg' href='/events'>
  View Events
</Button>
```

#### Implementation Details

- Supports both button and link functionality
- Implements loading states with spinner
- Includes proper accessibility attributes
- Uses consistent styling with design system

### Card Component

**File**: `src/components/ui/Card.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
  href?: string;
  external?: boolean;
  className?: string;
}
```

#### Features

- **Flexible Content**: Supports any child content
- **Image Support**: Optional image with optimization
- **Link Integration**: Can function as a link
- **Hover Effects**: Subtle animations
- **Responsive Design**: Mobile-optimized

#### Usage

```tsx
<Card
  title='Event Title'
  description='Event description'
  image='/images/event.jpg'
  href='/events/event-slug'
>
  Additional content here
</Card>
```

#### Implementation Details

- Uses Next.js Image for image optimization
- Implements proper semantic HTML structure
- Includes hover effects with CSS transitions
- Handles external links appropriately

### ErrorBoundary Component

**File**: `src/components/ui/ErrorBoundary.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}
```

#### Features

- **Error Catching**: Catches JavaScript errors in component tree
- **Fallback UI**: Displays error message when errors occur
- **Error Reporting**: Logs errors for debugging
- **Graceful Degradation**: Prevents app crashes

#### Usage

```tsx
<ErrorBoundary>
  <ComponentThatMightError />
</ErrorBoundary>
```

#### Implementation Details

- Extends React.Component for error boundary functionality
- Implements componentDidCatch lifecycle method
- Provides user-friendly error messages
- Includes error logging for debugging

### LoadingSpinner Component

**File**: `src/components/ui/LoadingSpinner.tsx`  
**Status**: ✅ Implemented

#### Props Interface

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### Features

- **Multiple Sizes**: Small, medium, large variants
- **Customizable Styling**: Accepts custom className
- **Accessibility**: Proper ARIA attributes
- **Smooth Animation**: CSS-based loading animation

#### Usage

```tsx
<LoadingSpinner size='md' />
```

#### Implementation Details

- Uses CSS animations for smooth loading effect
- Implements proper accessibility attributes
- Consistent with design system styling
- Lightweight and performant

## 📱 Responsive Design

### Breakpoint Strategy

```css
/* Mobile First Approach */
/* Base styles for mobile */
/* sm: 640px and up */
/* md: 768px and up */
/* lg: 1024px and up */
/* xl: 1280px and up */
/* 2xl: 1536px and up */
```

### Component Responsiveness

- **Header**: Collapsible mobile menu
- **Hero**: Stacked layout on mobile
- **EventCard**: Single column on mobile, multi-column on desktop
- **SponsorGrid**: Adaptive grid based on screen size
- **Footer**: Stacked sections on mobile

## ♿ Accessibility Features

### ARIA Implementation

- **Navigation**: Proper ARIA labels for menu items
- **Buttons**: Descriptive button labels
- **Images**: Alt text for all images
- **Forms**: Proper form labels and descriptions
- **Loading States**: ARIA live regions for dynamic content

### Keyboard Navigation

- **Tab Order**: Logical tab sequence
- **Focus Indicators**: Visible focus states
- **Skip Links**: Skip to main content
- **Menu Navigation**: Keyboard-accessible menus

### Screen Reader Support

- **Semantic HTML**: Proper heading hierarchy
- **Landmark Roles**: Navigation, main, footer roles
- **Descriptive Text**: Clear, descriptive content
- **State Announcements**: Dynamic content announcements

## 🎨 Design System Integration

### Color Usage

```typescript
// Primary colors
const colors = {
  primary: '#007ACC', // Claude blue
  secondary: '#6B7280', // Gray
  accent: '#FF6B9D', // Pink
  background: '#FFFFFF',
  surface: '#F9FAFB',
};
```

### Typography Scale

```typescript
// Font sizes
const typography = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
};
```

### Spacing System

```typescript
// Spacing scale
const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
  16: '4rem',
};
```

## 🧪 Testing Strategy

### Component Testing

- **Unit Tests**: Individual component behavior
- **Props Testing**: All prop combinations
- **Event Testing**: User interactions
- **Accessibility Testing**: ARIA compliance

### Test Examples

```typescript
// Button component test
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## 🔄 Performance Optimization

### Component Optimization

- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Dynamic imports for large components
- **Image Optimization**: Next.js Image component usage
- **Bundle Splitting**: Code splitting for better performance

### Best Practices

- **Minimal Re-renders**: Optimized component updates
- **Efficient Event Handlers**: Debounced and throttled functions
- **Proper Key Props**: Unique keys for list items
- **Conditional Rendering**: Efficient conditional displays

## 📋 Component Checklist

### Implementation Status

- [x] Header component with navigation
- [x] Footer component with links
- [x] Hero component with call-to-action
- [x] EventCard component with event display
- [x] SponsorGrid component with tier system
- [x] Button component with variants
- [x] Card component with flexible content
- [x] ErrorBoundary component for error handling
- [x] LoadingSpinner component for loading states

### Quality Assurance

- [x] TypeScript interfaces defined
- [x] Responsive design implemented
- [x] Accessibility features included
- [x] Performance optimization applied
- [x] Testing coverage established
- [x] Documentation completed
