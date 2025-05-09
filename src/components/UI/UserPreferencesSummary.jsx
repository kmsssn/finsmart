// src/components/UI/UserPreferencesSummary.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaGlobe, FaCalendarAlt, FaCog, FaGlobeAsia } from 'react-icons/fa';
import { loadUserPreferences } from '../../utils/userPreferences';

const UserPreferencesSummary = () => {
  const preferences = loadUserPreferences();
  
  // Convert date format to readable text
  const getDateFormatLabel = (format) => {
    switch (format) {
      case 'dd.MM.yyyy':
        return 'ДД.ММ.ГГГГ';
      case 'MM/dd/yyyy':
        return 'ММ/ДД/ГГГГ';
      case 'yyyy-MM-dd':
        return 'ГГГГ-ММ-ДД';
      default:
        return format;
    }
  };
  
  // Get currency symbol
  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'KZT':
        return '₸';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'RUB':
        return '₽';
      default:
        return code;
    }
  };
  
  // Get currency name
  const getCurrencyName = (code) => {
    switch (code) {
      case 'KZT':
        return 'Тенге';
      case 'USD':
        return 'Доллар США';
      case 'EUR':
        return 'Евро';
      case 'RUB':
        return 'Рубль';
      default:
        return code;
    }
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md p-4 transition-all duration-300 hover:shadow-xl dark:bg-gray-800/80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">Ваши настройки</h3>
        <Link 
          to="/settings?tab=user"
          className="text-primary hover:text-primary-dark dark:text-primary-light"
        >
          <FaCog />
        </Link>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <FaGlobeAsia className="mr-2 text-primary" size={14} />
          <span>Страна: </span>
          <span className="ml-auto font-medium text-gray-800 dark:text-gray-200">{preferences.country}</span>
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <FaMapMarkerAlt className="mr-2 text-primary" size={14} />
          <span>Город: </span>
          <span className="ml-auto font-medium text-gray-800 dark:text-gray-200">{preferences.city}</span>
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <FaGlobe className="mr-2 text-primary" size={14} />
          <span>Валюта: </span>
          <span className="ml-auto font-medium text-gray-800 dark:text-gray-200">
            {getCurrencySymbol(preferences.currency)} ({getCurrencyName(preferences.currency)})
          </span>
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <FaCalendarAlt className="mr-2 text-primary" size={14} />
          <span>Формат даты: </span>
          <span className="ml-auto font-medium text-gray-800 dark:text-gray-200">
            {getDateFormatLabel(preferences.dateFormat)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesSummary;