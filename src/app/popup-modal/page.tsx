'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExitIntentModal } from '@/components/ExitIntentModal';

export default function PopupModalTestPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <>
      <div className='min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-8'>
        <div className='max-w-md text-center space-y-6'>
          <h1 className='text-3xl font-bold'>Popup Modal Test Page</h1>
          <p className='text-muted-foreground'>
            This page is for testing the exit intent modal. It will not be
            indexed by search engines.
          </p>

          <Button onClick={() => setShowModal(true)} size='lg'>
            Show Modal
          </Button>

          <div className='text-sm text-muted-foreground/60 mt-8'>
            <p>
              The modal should appear automatically when you load this page.
            </p>
            <p>Click the button above to show it again after closing.</p>
          </div>
        </div>

        <ExitIntentModal
          forceOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    </>
  );
}
