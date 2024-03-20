import React, { useState, useContext, createContext, ReactNode } from 'react';

// Define the context type
interface FontSizeContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
}

// Create the context with a default value
const FontSizeContext = createContext<FontSizeContextType>({
  fontSize: 16, // Default font size
  setFontSize: () => {}, // Placeholder function
});

// Update the FontSizeProvider to correctly type its props
interface FontSizeProviderProps {
  children: ReactNode; // This tells TypeScript that this component accepts children
}

export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({ children }) => {
  const [fontSize, setFontSize] = useState(16);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

// Hook for consuming the context
export const useFontSize = () => useContext(FontSizeContext);

const FontSlider = () => {
  const { fontSize, setFontSize } = useFontSize();


  return (
    <div>
      <label htmlFor="font-slider">Adjust Font Size:</label>
      <input
        type="range"
        id="font-slider"
        min="12"
        max="24"
        value={fontSize}
        onChange={(e) => {
          const newFontSize = Number(e.target.value);
          setFontSize(newFontSize); // Update the context
          document.documentElement.style.setProperty('--font-size', `${newFontSize}px`); // Update the CSS variable
        }}
      />
    </div>
  );
};

export default FontSlider;
