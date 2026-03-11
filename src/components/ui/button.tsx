/* eslint-disable prettier/prettier */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border text-center text-base font-medium shadow-sm transition-all duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:shadow-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-foreground text-background hover:bg-foreground/90',
        neutral:
          'border-transparent bg-foreground text-background hover:bg-foreground/90',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border-zinc-300 bg-white text-foreground hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900/60',
        secondary:
          'border-transparent bg-zinc-100 text-foreground shadow-none hover:bg-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800/80',
        ghost:
          'border-transparent bg-transparent text-foreground shadow-none hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800/80',
        link: 'h-auto border-transparent bg-transparent px-0 py-0 text-primary shadow-none underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3.5 py-1.5 text-[15px]',
        lg: 'h-10 px-5 py-2 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
