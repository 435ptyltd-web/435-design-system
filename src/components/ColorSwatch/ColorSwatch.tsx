import React from 'react';

export type BrandColorName = 'ink' | 'bone' | 'stone' | 'sand' | 'sage' | 'blush';

const HEX: Record<BrandColorName, string> = {
  ink: '#1F2120',
  bone: '#EFE8DC',
  stone: '#B8AFA2',
  sand: '#D9CCB4',
  sage: '#93A285',
  blush: '#E8C9C0',
};

export interface ColorSwatchProps extends React.HTMLAttributes<HTMLDivElement> {
  /** One of the six locked 435 Group brand colors. */
  name: BrandColorName;
}

/** Renders a single brand color chip with its name and hex — for palette references, not UI chrome. */
export function ColorSwatch({ name, className, ...rest }: ColorSwatchProps) {
  return (
    <div className={['ds-swatch', className].filter(Boolean).join(' ')} {...rest}>
      <div className="ds-swatch__chip" style={{ background: HEX[name] }} />
      <span className="ds-swatch__name">{name}</span>
      <span className="ds-swatch__hex">{HEX[name]}</span>
    </div>
  );
}
