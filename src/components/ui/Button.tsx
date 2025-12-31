import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode };

export const Button: React.FC<Props> = ({ children, ...props }) => {
  return (
    <button {...props}>
      {children}
    </button>
  );
};

export default Button;
