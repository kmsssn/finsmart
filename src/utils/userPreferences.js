// src/utils/userPreferences.js
import { convertCurrency } from './currencyConverter';

const PREFERENCES_KEY = 'user_preferences';

// Get default preferences
const getDefaultPreferences = () => {
  return {
    country: 'Kazakhstan', // Default country
    city: 'Almaty', // Default city
    currency: 'KZT', // Default currency
    dateFormat: 'dd.MM.yyyy', // Default date format
  };
};

// Load user preferences from localStorage
export const loadUserPreferences = () => {
  try {
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
    if (savedPreferences) {
      return JSON.parse(savedPreferences);
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
  
  // If no preferences found or error occurred, return defaults
  return getDefaultPreferences();
};

// Save user preferences to localStorage
export const saveUserPreferences = (preferences) => {
  try {
    const currentPreferences = loadUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPreferences));
    return updatedPreferences;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return preferences;
  }
};

// Get user country preference
export const getUserCountry = () => {
  const preferences = loadUserPreferences();
  return preferences.country;
};

// Update user country preference
export const setUserCountry = (country) => {
  return saveUserPreferences({ country });
};

// Get user city preference
export const getUserCity = () => {
  const preferences = loadUserPreferences();
  return preferences.city;
};

// Update user city preference
export const setUserCity = (city) => {
  return saveUserPreferences({ city });
};

// Get user currency preference
export const getUserCurrency = () => {
  const preferences = loadUserPreferences();
  return preferences.currency;
};

// Update user currency preference and convert balance
export const setUserCurrency = (newCurrency) => {
  const currentPreferences = loadUserPreferences();
  const oldCurrency = currentPreferences.currency;
  
  // Save new currency preference
  saveUserPreferences({ currency: newCurrency });
  
  // Convert balance if currency changed
  if (oldCurrency !== newCurrency) {
    try {
      // Get current balance
      const currentBalance = JSON.parse(localStorage.getItem('balance')) || 0;
      
      // Convert balance to new currency
      const convertedBalance = convertCurrency(currentBalance, oldCurrency, newCurrency);
      
      // Save converted balance
      localStorage.setItem('balance', JSON.stringify(convertedBalance));
      
      // Convert all transaction amounts
      const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
      
      if (transactions.length > 0) {
        const convertedTransactions = transactions.map(transaction => ({
          ...transaction,
          amount: convertCurrency(transaction.amount, oldCurrency, newCurrency)
        }));
        
        // Save converted transactions
        localStorage.setItem('transactions', JSON.stringify(convertedTransactions));
      }
      
      console.log(`Currency changed from ${oldCurrency} to ${newCurrency}. Balance converted.`);
    } catch (error) {
      console.error('Error converting currency values:', error);
    }
  }
  
  return currentPreferences;
};