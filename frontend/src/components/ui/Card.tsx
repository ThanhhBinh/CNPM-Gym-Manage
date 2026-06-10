import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional custom class names */
  className?: string;
  /** Optional title for the card */
  title?: React.ReactNode;
};

/**
 * Reusable card component – uses the `.card-glass` utility from `theme.css`.
 * It provides a subtle background blur and consistent padding.
 */
export const Card: React.FC<CardProps> = ({ className = '', title, children, ...rest }) => {
  return (
    <div className={`card-glass ${className}`} {...rest}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card;
