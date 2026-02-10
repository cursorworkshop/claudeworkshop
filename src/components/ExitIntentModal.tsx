'use client';

import { X, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STORAGE_KEY = 'exit_intent_shown';
const DELAY_MS = 10000; // Wait 10 seconds before enabling

// Pages where the modal should never appear
const BLOCKED_PATHS = ['/admin', '/popup-modal'];

interface ExitIntentModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function ExitIntentModal({
  forceOpen = false,
  onClose,
}: ExitIntentModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [canShow, setCanShow] = useState(false);

  // Check if current path is blocked
  const isBlockedPath = BLOCKED_PATHS.some(path => pathname?.startsWith(path));

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // Never show on blocked paths (admin, etc.)
    if (isBlockedPath) {
      return;
    }

    // Check if already shown (persists across sessions using localStorage)
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    // Wait before enabling exit intent
    const timer = setTimeout(() => setCanShow(true), DELAY_MS);

    return () => clearTimeout(timer);
  }, [forceOpen, isBlockedPath]);

  useEffect(() => {
    if (!canShow || forceOpen || isBlockedPath) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves toward top of page
      if (e.clientY < 10 && !localStorage.getItem(STORAGE_KEY)) {
        setIsOpen(true);
        // Use localStorage to remember across sessions
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [canShow, forceOpen, isBlockedPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit_intent' }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 28,
            }}
            className='relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden'
          >
            {/* Animated gradient accent at top */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className='h-1 bg-gradient-to-r from-zinc-300 via-zinc-500 to-zinc-300 origin-left'
            />

            <div className='p-8'>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleClose}
                className='absolute top-5 right-5 text-muted-foreground/50 hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-zinc-100'
                aria-label='Close'
              >
                <X className='w-4 h-4' />
              </motion.button>

              <AnimatePresence mode='wait'>
                {status === 'success' ? (
                  <motion.div
                    key='success'
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className='text-center py-6'
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 18,
                        delay: 0.1,
                      }}
                      className='w-16 h-16 mx-auto mb-5 rounded-full bg-zinc-100 flex items-center justify-center'
                    >
                      <Mail className='w-7 h-7 text-zinc-600' />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className='text-xl font-semibold mb-2'
                    >
                      Check your inbox
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className='text-muted-foreground text-sm'
                    >
                      The guide is on its way.
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div
                    key='form'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className='mb-6'
                    >
                      <h3 className='text-2xl font-semibold tracking-tight mb-3'>
                        Before you go
                      </h3>
                      <p className='text-muted-foreground text-sm leading-relaxed'>
                        Get The Enterprise Guide to Agentic Development. The
                        framework we use with Fortune 100 engineering teams.
                      </p>
                    </motion.div>

                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      onSubmit={handleSubmit}
                      className='space-y-3'
                    >
                      <Input
                        type='email'
                        placeholder='your@email.com'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className='h-12 bg-zinc-100 border-0 rounded-full pl-6 focus:bg-zinc-50 transition-colors'
                        required
                      />
                      <Button
                        type='submit'
                        className='w-full h-12 font-medium'
                        disabled={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className='flex items-center gap-2'
                          >
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full'
                            />
                            Sending...
                          </motion.span>
                        ) : (
                          'Send me the guide'
                        )}
                      </Button>
                      <AnimatePresence>
                        {status === 'error' && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className='text-sm text-red-600 text-center pt-1'
                          >
                            Something went wrong. Please try again.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.form>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className='text-xs text-muted-foreground/60 text-center mt-5'
                    >
                      No spam, ever. Unsubscribe anytime.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
