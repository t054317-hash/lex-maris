'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type GlassCardProps = HTMLMotionProps<'div'> & {
  /** Adds hover lift + gold border bloom. Off for static/dense panels. */
  interactive?: boolean;
  /** Sweeps a specular highlight across the top edge once on mount. */
  sheen?: boolean;
};

/**
 * The platform's primary surface. Everything sits on one of these so blur
 * radius, border treatment and hover physics stay identical across the app.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    { interactive = true, sheen = false, className = '', children, ...rest },
    ref,
  ) {
    return (
      <motion.div
        ref={ref}
        data-cursor={interactive ? 'hover' : undefined}
        className={`glass ${interactive ? 'glass-interactive' : ''} overflow-hidden ${className}`}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        {...rest}
      >
        {sheen && (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-px left-0 h-px w-1/3 animate-shimmer"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(231,199,101,0.9), transparent)',
            }}
          />
        )}
        {children as React.ReactNode}
      </motion.div>
    );
  },
);
