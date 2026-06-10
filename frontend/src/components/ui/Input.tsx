import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Optional label displayed above the input */
  label?: string;
  /** Custom class name for the wrapper */
  wrapperClassName?: string;
};

/**
 * Theme‑aware input component. Uses the CSS variables defined in `theme.css`
 * for border, background and focus colors. Supports a label.
 */
export const Input: React.FC<InputProps> = ({ label, wrapperClassName = '', className = '', ...rest }) => {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={rest.id}>
          {label}
        </label>
      )}
      <input
        className={`input ${className}`}
        {...rest}
      />
    </div>
  );
};

export default Input;
