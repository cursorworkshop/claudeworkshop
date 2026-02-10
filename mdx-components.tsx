import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Define MDXComponents type locally since mdx/types is not available
// This matches the structure expected by Next.js MDX
type MDXComponents = {
  [key: string]: React.ComponentType<any>;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom heading styles for better SEO structure
    h1: ({ children }) => (
      <h1 className='text-4xl font-bold tracking-tight text-foreground mt-8 mb-4'>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className='text-2xl font-semibold text-foreground mt-8 mb-3 scroll-mt-20'>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className='text-xl font-semibold text-foreground mt-6 mb-2'>
        {children}
      </h3>
    ),
    // Paragraph with good readability
    p: ({ children }) => (
      <p className='text-base leading-7 text-muted-foreground mb-4'>
        {children}
      </p>
    ),
    // Links with proper styling
    a: ({ href, children }) => {
      const isExternal = href?.startsWith('http');
      if (isExternal) {
        return (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary underline underline-offset-4 hover:text-primary/80'
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href || '#'}
          className='text-primary underline underline-offset-4 hover:text-primary/80'
        >
          {children}
        </Link>
      );
    },
    // Lists
    ul: ({ children }) => (
      <ul className='my-4 ml-6 list-disc space-y-2 text-muted-foreground'>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className='my-4 ml-6 list-decimal space-y-2 text-muted-foreground'>
        {children}
      </ol>
    ),
    li: ({ children }) => <li className='leading-7'>{children}</li>,
    // Code blocks
    pre: ({ children }) => (
      <pre className='my-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm'>
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-sm'>
        {children}
      </code>
    ),
    // Blockquotes for citations (important for LLM visibility)
    blockquote: ({ children }) => (
      <blockquote className='my-4 border-l-4 border-primary pl-4 italic text-muted-foreground'>
        {children}
      </blockquote>
    ),
    // Images with Next.js optimization
    img: ({ src, alt }) => (
      <Image
        src={src || ''}
        alt={alt || ''}
        width={800}
        height={450}
        className='my-6 rounded-lg'
      />
    ),
    // Horizontal rule
    hr: () => <hr className='my-8 border-border' />,
    // Tables for structured data (helps with LLM understanding)
    table: ({ children }) => (
      <div className='my-6 overflow-x-auto'>
        <table className='w-full border-collapse text-sm'>{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className='border border-border bg-muted px-4 py-2 text-left font-semibold'>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className='border border-border px-4 py-2'>{children}</td>
    ),
    ...components,
  };
}
