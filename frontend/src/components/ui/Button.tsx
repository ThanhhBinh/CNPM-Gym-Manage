import React from 'react';

export interface ButtonProps {
  /** Button label or content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disable button */
  disabled?: boolean;
  /** Variant style: primary (filled), secondary (outline), export (gradient) */
  variant?: 'primary' | 'secondary' | 'export';
  /** Additional Tailwind class names */
  className?: string;
  /** Type attribute */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Reusable button component with glass‑morphism and hover effects.
 * Uses Tailwind CSS utility classes to provide a premium look.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
}) => {
  const baseClasses =
    'px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const primaryClasses =
    'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none';
  const secondaryClasses =
    'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm hover:shadow-md disabled:opacity-40 disabled:pointer-events-none';
  const exportClasses =
    'bg-gradient-to-r from-emerald-400 to-sky-500 text-white hover:from-emerald-500 hover:to-sky-600 shadow-md disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses =
    variant === 'primary' ? primaryClasses :
    variant === 'secondary' ? secondaryClasses :
    exportClasses;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
