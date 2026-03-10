import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(_: EventPageProps): Promise<Metadata> {
  return {
    title: 'Page Not Found',
  };
}

export default async function WorkshopPage(_: EventPageProps) {
  notFound();
}
