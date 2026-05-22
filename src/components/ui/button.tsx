/**
 * Button — shadcn/ui-style primitive (CVA + Radix Slot)
 *
 * Variants are tuned to FMT's premium aesthetic. Every variant uses the custom
 * --ease-fluid cubic-bezier curve and a button-in-button trailing icon socket
 * is supported via the <Button.Trailing /> compound pattern below.
 */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  // Base — every variant inherits cinematic motion + pressed-state feedback
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold ' +
  'transition-all duration-500 [transition-timing-function:var(--ease-fluid)] ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple/40 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        // Solid apple-red — primary conversion action
        primary:
          'bg-apple text-white shadow-[0_12px_30px_rgba(192,57,43,0.25)] ' +
          'hover:bg-apple/90 hover:shadow-[0_18px_40px_rgba(192,57,43,0.35)]',
        // Solid chalkboard — secondary high-contrast
        chalkboard:
          'bg-chalkboard text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] ' +
          'hover:bg-apple hover:shadow-[0_18px_40px_rgba(192,57,43,0.3)]',
        // Glass / ghost — sits on light + dark backgrounds
        glass:
          'bg-white/85 backdrop-blur-xl ring-1 ring-chalkboard/10 text-chalkboard ' +
          'hover:bg-white hover:ring-chalkboard/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)]',
        // Outline — quiet companion
        outline:
          'bg-transparent ring-1 ring-chalkboard/15 text-chalkboard/75 ' +
          'hover:ring-chalkboard/30 hover:text-chalkboard hover:bg-chalkboard/[0.02]',
        // Link-style — for inline CTAs
        link:
          'bg-transparent text-apple hover:text-apple/80 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-10 px-5 text-xs uppercase tracking-[0.18em] rounded-full',
        md: 'h-12 px-7 text-sm uppercase tracking-[0.18em] rounded-full',
        lg: 'h-14 pl-7 pr-2 text-sm uppercase tracking-[0.18em] rounded-full',
        xl: 'h-16 pl-8 pr-2.5 text-base uppercase tracking-[0.18em] rounded-full',
        icon: 'h-11 w-11 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

/**
 * Trailing icon socket — the nested circular button-in-button per the
 * "premium agency" spec. Drop inside a Button to get the magnetic
 * arrow-pill that translates on hover.
 */
const ButtonTrailing = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { dark?: boolean }
>(({ className, dark = false, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center h-9 w-9 rounded-full transition-all',
      'group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105',
      dark ? 'bg-white/10 group-hover:bg-apple text-white' : 'bg-chalkboard/5 group-hover:bg-chalkboard text-chalkboard group-hover:text-white',
      className,
    )}
    {...props}
  >
    {children}
  </span>
));
ButtonTrailing.displayName = 'Button.Trailing';

export { Button, ButtonTrailing, buttonVariants };
