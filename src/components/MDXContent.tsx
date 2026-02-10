import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

type Props = {
  content: string;
};

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkGfm).use(html).process(markdown);
  return result.toString();
}

export async function MDXContent({ content }: Props) {
  const htmlContent = await markdownToHtml(content);

  return (
    <div className='mdx-content'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .mdx-content {
          font-size: 1.125rem;
          line-height: 1.75;
          color: #1a1a1a;
        }
        
        .mdx-content h1,
        .mdx-content h2 {
          font-weight: 600;
          line-height: 1.3;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          scroll-margin-top: 5rem;
        }
        
        .mdx-content h1 { font-size: 2rem; }
        .mdx-content h2 { 
          font-size: 1.5rem; 
          border-bottom: 1px solid #e5e5e5; 
          padding-bottom: 0.75rem; 
          margin-top: 3rem;
        }
        
        /* h3 and h4 render as bold text, not separate headings */
        .mdx-content h3,
        .mdx-content h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .mdx-content p {
          margin-bottom: 1.5rem;
        }
        
        .mdx-content a {
          color: #14b8a6;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        
        .mdx-content a:hover {
          color: #0d9488;
        }
        
        .mdx-content strong {
          font-weight: 600;
        }
        
        .mdx-content ul,
        .mdx-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .mdx-content ul { list-style-type: disc; }
        .mdx-content ol { list-style-type: decimal; }
        
        .mdx-content li {
          margin-bottom: 0.5rem;
        }
        
        .mdx-content li > ul,
        .mdx-content li > ol {
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        
        /* Code blocks */
        .mdx-content pre {
          background-color: #18181b;
          color: #fafafa;
          border-radius: 0.5rem;
          padding: 1.25rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          line-height: 1.7;
        }
        
        .mdx-content code {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          font-size: 0.875em;
        }
        
        .mdx-content :not(pre) > code {
          background-color: #f4f4f5;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          color: #18181b;
        }
        
        /* Tables */
        .mdx-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
          font-size: 0.9375rem;
        }
        
        .mdx-content thead {
          background-color: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .mdx-content th {
          text-align: left;
          padding: 0.75rem 1rem;
          font-weight: 600;
          color: #374151;
        }
        
        .mdx-content td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }
        
        .mdx-content tbody tr:hover {
          background-color: #f9fafb;
        }
        
        /* Blockquotes */
        .mdx-content blockquote {
          border-left: 4px solid #14b8a6;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
        }
        
        .mdx-content blockquote p {
          margin-bottom: 0;
        }
        
        /* Horizontal rules */
        .mdx-content hr {
          border: none;
          border-top: 1px solid #e5e5e5;
          margin: 3rem 0;
        }
        
        /* Images */
        .mdx-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
      `,
        }}
      />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
