import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label rendered above the field in tracked Archivo caps. */
  label?: string;
  /** Hint or validation message rendered below the field in DM Mono. */
  hint?: string;
  /** Marks the field as invalid — colors the border and hint blush/red. */
  error?: boolean;
}

export function Input({ label, hint, error = false, id, className, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  const inputClasses = ['ds-input', error && 'ds-input--error', className].filter(Boolean).join(' ');
  return (
    <div className="ds-field">
      {label && (
        <label className="ds-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className={inputClasses} {...rest} />
      {hint && (
        <span className={['ds-field__hint', error && 'ds-field__hint--error'].filter(Boolean).join(' ')}>
          {hint}
        </span>
      )}
    </div>
  );
}
