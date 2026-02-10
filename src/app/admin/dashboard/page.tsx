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
    <div className='min-h-screen bg-background'>
      <div className='mx-auto flex w-full max-w-7xl flex-col px-6 pt-24 pb-16'>
        <div className='mb-8 flex flex-col gap-2'>
          <h1 className='text-3xl font-semibold'>
            Traffic &amp; Form Analytics
          </h1>
          <p className='text-muted-foreground'>
            Track referrers, campaigns, and how long visitors stay before
            submitting the contact form.
          </p>
        </div>
        <AdminDashboardClient />
      </div>
    </div>
  );
}
