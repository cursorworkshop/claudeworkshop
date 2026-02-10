# Contributing Guidelines

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: ✅ Active

## 🎯 Overview

We welcome contributions to the Claude Workshop website! This guide outlines how to contribute to the project, including code standards, content guidelines, and the development workflow.

## 🤝 How to Contribute

### Types of Contributions

- **Code Contributions**: Bug fixes, feature enhancements, performance improvements
- **Content Contributions**: Event reports, speaker profiles, community stories
- **Design Contributions**: UI/UX improvements, accessibility enhancements
- **Documentation**: Code documentation, user guides, tutorials
- **Testing**: Test coverage, bug reports, quality assurance

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 🛠️ Development Setup

### Prerequisites

```bash
# Required software
Node.js 20+
pnpm 8+
Git
```

### Local Development

```bash
# Clone repository
git clone https://github.com/your-username/claude-workshop-website.git
cd claude-workshop-website

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint
```

## 📝 Code Standards

### TypeScript Guidelines

```typescript
// Use strict TypeScript
// Prefer interfaces over types for object shapes
interface ComponentProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

// Use proper type annotations
const handleClick = (event: React.MouseEvent): void => {
  // Implementation
};

// Avoid 'any' type
// Use proper generic types
const [data, setData] = useState<Event[]>([]);
```

### React Guidelines

```typescript
// Use functional components with hooks
const MyComponent: React.FC<ComponentProps> = ({ title, children }) => {
  const [state, setState] = useState(false);

  useEffect(() => {
    // Side effects
  }, []);

  return (
    <div className="component">
      <h1>{title}</h1>
      {children}
    </div>
  );
};

// Use proper prop types
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### CSS/Tailwind Guidelines

```css
/* Use Tailwind CSS classes */
/* Follow mobile-first approach */
<div className="flex flex-col md:flex-row gap-4 p-6">
  <div className="w-full md:w-1/2">
    <!-- Content -->
  </div>
</div>

/* Use consistent spacing */
/* Use design system colors */
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Click me
</button>
```

## 📦 Component Guidelines

### Component Structure

```typescript
// Component file structure
import React from 'react';
import { ComponentProps } from '@/lib/types';

interface MyComponentProps extends ComponentProps {
  // Additional props
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description,
  className,
  children,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
};
```

### Component Testing

```typescript
// Test file structure
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders with correct props', () => {
    render(
      <MyComponent title="Test Title" description="Test Description" />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(
      <MyComponent onClick={handleClick} title="Test" />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## 📝 Content Guidelines

### Event Content

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
---

Full event description in markdown...
```

### Content Standards

- **Clear Titles**: Descriptive and engaging
- **Complete Information**: All required fields filled
- **High-Quality Images**: Optimized for web
- **Proper Formatting**: Consistent markdown structure
- **SEO Optimization**: Relevant keywords and descriptions

## 🧪 Testing Guidelines

### Test Structure

```typescript
// Test file naming
ComponentName.test.tsx;
ComponentName.spec.tsx;

// Test organization
describe('ComponentName', () => {
  describe('when rendering', () => {
    it('displays correct content', () => {
      // Test implementation
    });
  });

  describe('when user interacts', () => {
    it('handles click events', () => {
      // Test implementation
    });
  });
});
```

### Testing Best Practices

- **Test Behavior, Not Implementation**: Focus on user interactions
- **Use Descriptive Test Names**: Clear test descriptions
- **Test Edge Cases**: Handle error states and edge cases
- **Mock External Dependencies**: Isolate component testing
- **Maintain Test Coverage**: Aim for 80%+ coverage

### Accessibility Testing

```typescript
// Test accessibility
it('is accessible', () => {
  render(<MyComponent />);

  // Check for proper ARIA labels
  expect(screen.getByLabelText('Description')).toBeInTheDocument();

  // Check for proper heading structure
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
});
```

## 🔄 Git Workflow

### Branch Naming

```bash
# Feature branches
feature/component-name
feature/user-authentication
feature/event-registration

# Bug fix branches
fix/navigation-issue
fix/image-loading-bug
fix/accessibility-problem

# Hotfix branches
hotfix/critical-security-fix
hotfix/urgent-bug-fix
```

### Commit Messages

```bash
# Commit message format
type(scope): description

# Examples
feat(events): add event registration functionality
fix(header): resolve mobile menu accessibility issue
docs(readme): update installation instructions
style(components): improve button hover effects
refactor(utils): optimize date formatting function
test(components): add unit tests for EventCard
chore(deps): update dependencies to latest versions
```

### Pull Request Process

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push Changes**

   ```bash
   git push origin feature/new-feature
   ```

4. **Create Pull Request**
   - Use PR template
   - Add descriptive title
   - Include detailed description
   - Link related issues

## 📋 Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Accessibility verified
- [ ] Performance impact considered

## Screenshots (if applicable)

Add screenshots for UI changes

## Related Issues

Closes #123
```

## 🎨 Design Guidelines

### Design System

- **Colors**: Use Milano-inspired gradient and brand colors
- **Typography**: Inter font family with consistent sizing
- **Spacing**: Follow 8px grid system
- **Components**: Reuse existing UI components
- **Responsive**: Mobile-first design approach

### Accessibility

- **WCAG 2.1 AA**: Maintain accessibility compliance
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Screen Readers**: Proper ARIA labels and roles
- **Color Contrast**: Maintain sufficient contrast ratios
- **Focus Indicators**: Visible focus states

## 📚 Documentation

### Code Documentation

```typescript
/**
 * EventCard component for displaying event information
 * @param event - Event data to display
 * @param variant - Display variant (default, featured, compact)
 * @param className - Additional CSS classes
 * @returns JSX element
 */
export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'default',
  className,
}) => {
  // Implementation
};
```

### README Updates

- Update README.md for new features
- Document configuration changes
- Update installation instructions
- Add usage examples

## 🔍 Code Review

### Review Checklist

- [ ] Code follows style guidelines
- [ ] TypeScript types are correct
- [ ] Tests are included and passing
- [ ] Accessibility requirements met
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Documentation updated

### Review Process

1. **Automated Checks**: CI/CD pipeline validation
2. **Peer Review**: Code review by team members
3. **Testing**: Manual and automated testing
4. **Approval**: Maintainer approval required

## 🚀 Release Process

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes prepared
- [ ] Deployment tested

### Versioning

```bash
# Semantic versioning
MAJOR.MINOR.PATCH

# Examples
1.0.0 - Initial release
1.1.0 - New features
1.1.1 - Bug fixes
2.0.0 - Breaking changes
```

## 🤝 Community Guidelines

### Code of Conduct

- **Respect**: Treat all contributors with respect
- **Inclusion**: Welcome diverse perspectives
- **Collaboration**: Work together constructively
- **Learning**: Support learning and growth
- **Professionalism**: Maintain professional behavior

### Communication

- **Issues**: Use GitHub issues for bug reports
- **Discussions**: Use GitHub discussions for questions
- **Chat**: Join community chat for real-time discussion
- **Email**: Contact maintainers for sensitive topics

## 📞 Getting Help

### Resources

- **Documentation**: Check docs/ directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Ask questions in GitHub discussions
- **Community**: Join Claude Workshop community channels

### Contact

- **Maintainers**: @lucabianchi
- **Community**: Meetup, LinkedIn, Lu.ma
- **Email**: privacy@claudeworkshop.com

## 🙏 Acknowledgments

Thank you for contributing to the Claude Workshop community! Your contributions help make this project better for everyone.

**Remember**: Every contribution, no matter how small, makes a difference in building a vibrant AI development community globally.
