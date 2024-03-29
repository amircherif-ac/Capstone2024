import React, { ReactNode } from 'react';
import FontSlider from './globalFontSlider';
import { useFontSize } from './globalFontSlider';

// Define the type for the props of the Layout component
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { fontSize } = useFontSize();

  return (
    <div>
 
      
      {children}
    </div>
  );
};

export default Layout;
