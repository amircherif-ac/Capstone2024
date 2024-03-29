import React, { useState } from 'react';

const CustomSelect = () => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { id: 1, label: 'Option 1', colors: { color1: '#003A70', color2: '#657786', color3: '#add8e6' } },
    { id: 2, label: 'Option 2', colors: { color1: '#04364A', color2: '#04364A', color3: '#64CCC5' } },
    { id: 3, label: 'Option 3', colors: { color1: '#3C3633', color2: '#747264', color3: '#E0CCBE' } },
    { id: 3, label: 'Option 4', colors: { color1: '#000000', color2: '#ffffff', color3: '#ffffff' } },
    { id: 1, label: 'Option 5', colors: { color1: '#007F73', color2: '#4CCD99', color3: '#75A265' } },
  ];

  const handleSelect = (option) => {
    console.log('Updating colors to:', option.colors);
    // Update CSS variables
    document.documentElement.style.setProperty('--primary-color', option.colors.color1);
    document.documentElement.style.setProperty('--secondary-color', option.colors.color2);
    document.documentElement.style.setProperty('--tertiary-color', option.colors.color3);

    setIsOpen(false); // Close the dropdown
  };

  return (
    <div className="relative">
      <button
        className="border p-2 w-48 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        Color choice
        
      </button>
      {isOpen && (
        <div className="absolute border mt-1 w-48 bg-white">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(option)}
            >
              <div className={`h-4  mx-auto`} style={{ backgroundColor: option.colors.color1, width: "100%" }}></div>
              <div className={`h-4  mx-auto`} style={{ backgroundColor: option.colors.color2, width: "100%" }}></div>
              <div className={`h-4  mx-auto`} style={{ backgroundColor: option.colors.color3, width: "100%" }}></div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
