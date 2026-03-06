import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminDashboardClient } from '@/components/AdminDashboardClient';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    redirect('/admin');
  }

  return (
    <div className='min-h-screen bg-zinc-50'>
      <div className='mx-auto flex w-full max-w-none flex-col px-2 pt-24 pb-16 sm:px-4'>
        <div className='mb-8 flex flex-col gap-2'>
          <h1 className='text-3xl font-semibold text-zinc-900'>
            Operations Dashboard
          </h1>
          <p className='max-w-3xl text-zinc-600'>
            Manage website analytics, leads, and outreach templates from one
            function-first control surface. (MailerLite handles delivery.)
          </p>
        </div>
        <AdminDashboardClient />
      </div>
    </div>
  );
}
