
const PREFERENCES_KEY = 'user_preferences';

const getDefaultPreferences = () => {
  return {
    country: 'Kazakhstan', 
    city: 'Almaty',
    currency: 'KZT', 
    dateFormat: 'dd.MM.yyyy', 
  };
};

export const loadUserPreferences = () => {
  try {
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
    if (savedPreferences) {
      return JSON.parse(savedPreferences);
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
  
  return getDefaultPreferences();
};

export const saveUserPreferences = (preferences) => {
  try {
    const currentPreferences = loadUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPreferences));
    
    window.dispatchEvent(new Event('storage'));
    
    return updatedPreferences;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return preferences;
  }
};

export const getUserCountry = () => {
  const preferences = loadUserPreferences();
  return preferences.country;
};

export const setUserCountry = (country) => {
  return saveUserPreferences({ country });
};

export const getUserCity = () => {
  const preferences = loadUserPreferences();
  return preferences.city;
};

export const setUserCity = (city) => {
  return saveUserPreferences({ city });
};

export const getUserCurrency = () => {
  const preferences = loadUserPreferences();
  return preferences.currency;
};