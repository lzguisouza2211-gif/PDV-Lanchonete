import React from 'react';

export const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <header>{children}</header>;
};

export default Header;
