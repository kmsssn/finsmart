// src/components/UI/CountrySelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaGlobeAsia, FaSearch, FaTimes } from 'react-icons/fa';
import { setUserCountry } from '../../utils/userPreferences';

// List of countries with cities
const COUNTRIES_WITH_CITIES = {
  'Kazakhstan': [
    'Almaty', 'Astana', 'Shymkent', 'Karaganda', 'Aktobe', 
    'Taraz', 'Pavlodar', 'Semey', 'Atyrau', 'Kostanay',
    'Oral', 'Oskemen', 'Kokshetau', 'Turkistan', 'Aktau'
  ],
  'Russia': [
    'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan',
    'Omsk', 'Samara', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk'
  ],
  'United States': [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
  ],
  'China': [
    'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu',
    'Tianjin', 'Wuhan', 'Chongqing', 'Hangzhou', 'Xi\'an'
  ],
  'United Kingdom': [
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool',
    'Bristol', 'Edinburgh', 'Sheffield', 'Leeds', 'Newcastle'
  ]
};

const ALL_COUNTRIES = Object.keys(COUNTRIES_WITH_CITIES);

const CountrySelector = ({ currentCountry, onCountryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(ALL_COUNTRIES);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Filter countries based on search term
    if (searchTerm.trim() === '') {
      setFilteredCountries(ALL_COUNTRIES);
    } else {
      const filtered = ALL_COUNTRIES.filter(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (isOpen && 
          buttonRef.current && 
          !buttonRef.current.contains(event.target) &&
          !event.target.closest('.country-dropdown-portal')) {
        setIsOpen(false);
      }
    };

    // Handle scroll locking
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore scrolling
      if (isOpen) {
        document.body.style.overflow = originalStyle;
      }
    };
  }, [isOpen]);

  const handleCountrySelect = (country) => {
    onCountryChange(country);
    
    // Also update the global country setting so LocationSelector can respond
    setUserCountry(country);
    
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceToRight = window.innerWidth - rect.right;
      // Adjust position based on available space
      let left;
      if (spaceToRight < 250) { // If not enough space to the right
        left = Math.max(rect.left - 250 + rect.width, 10); // Align right edge of dropdown with right edge of button
      } else {
        left = rect.left; // Align left edge of dropdown with left edge of button
      }
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: left,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg py-1 px-2 transition-colors"
        title="Изменить страну"
      >
        <FaGlobeAsia size={14} className="mr-1 text-primary" />
        <span>{currentCountry}</span>
      </button>

      {isOpen && ReactDOM.createPortal(
        <div 
          className="fixed country-dropdown-portal"
          style={{
            top: dropdownPosition?.top || 0,
            left: dropdownPosition?.left || 0,
            zIndex: 9999,
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-56 animate-fade-in">
            <div className="p-2">
              <div className="relative mb-2">
                <input
                  type="text"
                  placeholder="Поиск страны..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-gray-200 bg-white/70 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <FaSearch className="absolute left-2 top-2.5 text-gray-400" size={14} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        country === currentCountry 
                          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {country}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-3 text-gray-500 dark:text-gray-400 text-sm">
                    Страны не найдены
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CountrySelector;
export { COUNTRIES_WITH_CITIES };