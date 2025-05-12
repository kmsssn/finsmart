import { getUserCountry } from './userPreferences';

const API_KEY = '893c89add978c3f76529f703848cda87'; 

const COUNTRY_CODES = {
  'Kazakhstan': 'KZ',
  'Russia': 'RU',
  'United States': 'US',
  'China': 'CN',
  'United Kingdom': 'GB'
};

const fetchWeatherFallback = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data not available');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data (fallback):', error);
    return getMockWeatherData(city);
  }
};

export const fetchWeather = async (city = 'Almaty') => {
  try {
    const userCountry = getUserCountry();
    const countryCode = COUNTRY_CODES[userCountry] || '';
    
    const locationQuery = countryCode 
      ? `${city},${countryCode}` 
      : city;
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${locationQuery}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      if (countryCode) {
        console.log(`Weather request failed for ${locationQuery}, trying without country code`);
        return fetchWeatherFallback(city);
      }
      throw new Error('Weather data not available');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData(city);
  }
};

export const getMockWeatherData = (city = 'Almaty') => {
  return {
    weather: [{ main: 'Clear', description: 'ясно' }],
    main: { temp: 22, feels_like: 24 },
    name: city
  };
};