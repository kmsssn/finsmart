// src/components/UI/ThemeToggle.jsx
import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-colors"
      aria-label={darkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
    >
      {darkMode ? (
        <FaSun className="text-white dark:text-yellow-300" size={18} />
      ) : (
        <FaMoon className="text-white dark:text-gray-400" size={18} />
      )}
    </button>
  );
};

export default ThemeToggle;