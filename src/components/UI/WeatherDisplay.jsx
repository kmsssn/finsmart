// src/components/UI/WeatherDisplay.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaSyncAlt, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { fetchWeather } from '../../utils/weatherApi';
import { getUserCity, setUserCity, getUserCountry, setUserCountry } from '../../utils/userPreferences';

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

const WeatherDisplay = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userCity, setCurrentCity] = useState(getUserCity());
  const [userCountry, setCurrentCountry] = useState(getUserCountry());
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    fetchWeatherData();
  }, [userCity]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      // Only close if click is outside both the button and the dropdown
      if (isLocationOpen && 
          buttonRef.current && 
          !buttonRef.current.contains(event.target) &&
          // Check if the click target is within the dropdown portal
          !event.target.closest('.location-dropdown-portal')) {
        setIsLocationOpen(false);
      }
    };

    // Handle scroll locking
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    if (isLocationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore scrolling
      if (isLocationOpen) {
        document.body.style.overflow = originalStyle;
      }
    };
  }, [isLocationOpen]);
  
  const fetchWeatherData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWeather(userCity);
      if (data) {
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Ошибка при получении данных о погоде:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCityChange = (e) => {
    const city = e.target.value;
    setCurrentCity(city);
    setUserCity(city);
  };
  
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setCurrentCountry(country);
    setUserCountry(country);
    
    // Set default city for selected country
    const cities = COUNTRIES_WITH_CITIES[country] || [];
    if (cities.length > 0) {
      setCurrentCity(cities[0]);
      setUserCity(cities[0]);
    }
  };
  
  const handleApplyLocation = () => {
    setIsLocationOpen(false);
    fetchWeatherData();
  };
  
  const refreshWeather = () => {
    fetchWeatherData();
  };
  
  const toggleLocationDropdown = () => {
    if (!isLocationOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceToRight = window.innerWidth - rect.right;
      // Adjust position based on available space
      let left;
      if (spaceToRight < 250) { // If not enough space to the right
        left = Math.max(rect.left - 250 + rect.width, 10); // Align right edge with button
      } else {
        left = rect.left; // Align left edge with button
      }
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: left,
      });
    }
    setIsLocationOpen(!isLocationOpen);
  };
  
  // Get weather icon
  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain) {
      case 'Clear':
        return '☀️';
      case 'Clouds':
        return '☁️';
      case 'Rain':
      case 'Drizzle':
        return '🌧️';
      case 'Thunderstorm':
        return '⛈️';
      case 'Snow':
        return '❄️';
      case 'Mist':
      case 'Smoke':
      case 'Haze':
      case 'Dust':
      case 'Fog':
        return '🌫️';
      default:
        return '🌤️';
    }
  };
  
  return (
    <div className="weather-display-wrapper">
      {/* Weather Display */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg py-2 px-4 shadow-md dark:shadow-lg flex items-center transition-all duration-300 hover:shadow-lg">
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mr-3"></div>
            <p className="text-gray-500 text-sm">Загрузка...</p>
          </div>
        ) : weatherData ? (
          <>
            <div className="mr-3">
              <span className="text-2xl" title={weatherData.weather[0].description}>
                {getWeatherIcon(weatherData.weather[0].main)}
              </span>
            </div>
            <div>
              <div className="flex items-center">
                <button 
                  ref={buttonRef}
                  onClick={toggleLocationDropdown}
                  className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg py-1 px-2 transition-colors"
                >
                  <FaMapMarkerAlt className="mr-1 text-primary" size={14} />
                  <span>{userCountry}, {userCity}</span>
                </button>
                <button 
                  onClick={refreshWeather}
                  className="p-1 text-gray-400 hover:text-primary rounded-full transition-colors ml-1"
                  title="Обновить погоду"
                >
                  <FaSyncAlt size={12} />
                </button>
              </div>
              <div className="flex items-center">
                <p className="font-medium">{Math.round(weatherData.main.temp)}°C</p>
                {weatherData.main.feels_like && Math.round(weatherData.main.feels_like) !== Math.round(weatherData.main.temp) && (
                  <p className="text-xs text-gray-500 ml-2">
                    Ощущается как {Math.round(weatherData.main.feels_like)}°C
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center">
            <span className="text-gray-500 text-2xl mr-3">🌤️</span>
            <div>
              <div className="flex items-center">
                <button 
                  ref={buttonRef}
                  onClick={toggleLocationDropdown}
                  className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg py-1 px-2 transition-colors"
                >
                  <FaMapMarkerAlt className="mr-1 text-primary" size={14} />
                  <span>{userCountry}, {userCity}</span>
                </button>
                <button 
                  onClick={refreshWeather}
                  className="p-1 text-gray-400 hover:text-primary rounded-full transition-colors ml-1"
                  title="Обновить погоду"
                >
                  <FaSyncAlt size={12} />
                </button>
              </div>
              <p className="text-gray-500">Нет данных</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Location Dropdown using Portal */}
      {isLocationOpen && ReactDOM.createPortal(
        <div 
          className="fixed location-dropdown-portal"
          style={{
            top: dropdownPosition?.top || 0,
            left: dropdownPosition?.left || 0,
            zIndex: 9999,
          }}
          ref={dropdownRef}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-64 animate-fade-in"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Выбрать местоположение</h3>
            </div>
            
            <div className="p-3">
              <div className="mb-3">
                <label className="block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Страна</label>
                <div className="relative">
                  <select
                    value={userCountry}
                    onChange={handleCountryChange}
                    className="w-full px-3 py-2 appearance-none rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.keys(COUNTRIES_WITH_CITIES).map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <FaChevronDown className="text-gray-400" size={12} />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 dark:text-gray-300 text-xs font-medium mb-1">Город</label>
                <div className="relative">
                  <select
                    value={userCity}
                    onChange={handleCityChange}
                    className="w-full px-3 py-2 appearance-none rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {COUNTRIES_WITH_CITIES[userCountry]?.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <FaChevronDown className="text-gray-400" size={12} />
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleApplyLocation}
                className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors"
              >
                Применить
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default WeatherDisplay;