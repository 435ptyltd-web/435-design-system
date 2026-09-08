import React from 'react';

export type CardVariant = 'default' | 'inverse' | 'flat';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Optional title rendered in Cormorant Garamond Light. */
  title?: string;
}

export function Card({ variant = 'default', title, className, children, ...rest }: CardProps) {
  const classes = ['ds-card', variant !== 'default' && `ds-card--${variant}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {title && <h3 className="ds-card__title">{title}</h3>}
      {children}
    </div>
  );
}
