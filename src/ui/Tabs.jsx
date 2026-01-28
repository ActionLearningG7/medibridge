/**
 * Tabs Component
 * Tab navigation with content panes
 */

import React, { useState } from 'react';

export const Tabs = ({ defaultTab = 0, tabs = [], onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-0">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === index
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export const TabsManual = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const TabList = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 overflow-x-auto ${className}`}>
    <div className="flex gap-0">
      {children}
    </div>
  </div>
);

export const TabButton = ({ isActive = false, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      isActive
        ? 'border-primary-600 text-primary-600'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    } ${className}`}
  >
    {children}
  </button>
);

export const TabContent = ({ isActive = false, className = '', children }) => (
  <div className={`${isActive ? 'block' : 'hidden'} ${className}`}>
    {children}
  </div>
);
