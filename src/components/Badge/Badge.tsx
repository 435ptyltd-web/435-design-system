import React from 'react';

export type BadgeTone = 'ink' | 'sage' | 'sand' | 'stone' | 'blush';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Brand palette tone. `blush` is a highlight — use sparingly, per brand rules. */
  tone?: BadgeTone;
}

export function Badge({ tone = 'sage', className, children, ...rest }: BadgeProps) {
  const classes = ['ds-badge', `ds-badge--${tone}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
