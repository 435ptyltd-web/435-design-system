import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Sage-colored rule instead of the default stone. */
  accent?: boolean;
}

export function Divider({ accent = false, className, ...rest }: DividerProps) {
  const classes = ['ds-divider', accent && 'ds-divider--accent', className].filter(Boolean).join(' ');
  return <hr className={classes} {...rest} />;
}
