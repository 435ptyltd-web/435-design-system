import React from 'react';

type AsProp<T extends React.ElementType> = { as?: T };
type PolymorphicProps<T extends React.ElementType> = AsProp<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof AsProp<T>>;

function makeText<TDefault extends React.ElementType>(defaultTag: TDefault, className: string) {
  return function Text<T extends React.ElementType = TDefault>({
    as,
    className: extra,
    ...rest
  }: PolymorphicProps<T>) {
    const Tag = (as ?? defaultTag) as React.ElementType;
    return <Tag className={[className, extra].filter(Boolean).join(' ')} {...rest} />;
  };
}

/** Large hero numerals/headline — Cormorant Garamond Light, fluid size. */
export const Display = makeText('h1', 'ds-display');
/** Cormorant Garamond Light, --fs-h1. */
export const Heading1 = makeText('h1', 'ds-heading-1');
/** Cormorant Garamond Light, --fs-h2. */
export const Heading2 = makeText('h2', 'ds-heading-2');
/** Tracked Archivo caps, --fs-h3 — use for section labels, not body headings. */
export const Heading3 = makeText('h3', 'ds-heading-3');
/** Archivo body copy. */
export const Body = makeText('p', 'ds-body');
/** Tracked Archivo caps label, matches Button/Input label styling. */
export const LabelText = makeText('span', 'ds-label-text');
/** DM Mono — marginalia, metadata, timestamps. */
export const Mono = makeText('span', 'ds-mono');
