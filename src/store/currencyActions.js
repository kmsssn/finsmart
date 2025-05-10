// src/store/currencyActions.js
import { updateAllTransactionAmounts } from './transactionSlice';
import { convertCurrencyWithCurrentRate } from '../utils/exchange-rate-api';
import { saveUserPreferences, loadUserPreferences } from '../utils/userPreferences';

// Сохранение курса конвертации для обратимости
const saveConversionRate = (fromCurrency, toCurrency, rate, reversalRate) => {
  const key = `conversion_${fromCurrency}_${toCurrency}`;
  const reverseKey = `conversion_${toCurrency}_${fromCurrency}`;
  
  localStorage.setItem(key, JSON.stringify({
    rate: rate,
    timestamp: Date.now()
  }));
  
  // Сохраняем обратный курс для полной обратимости
  localStorage.setItem(reverseKey, JSON.stringify({
    rate: reversalRate,
    timestamp: Date.now()
  }));
};

// Получение сохраненного курса конвертации
const getSavedConversionRate = (fromCurrency, toCurrency) => {
  const key = `conversion_${fromCurrency}_${toCurrency}`;
  const saved = localStorage.getItem(key);
  
  if (saved) {
    const parsed = JSON.parse(saved);
    // Проверяем, что курс не старше 24 часов
    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
      return parsed.rate;
    }
  }
  
  return null;
};

/**
 * Change currency and convert all amounts in transactions and balance
 * @param {string} newCurrency - New currency code (KZT, USD, EUR, RUB)
 * @returns {Function} Thunk action
 */
export const changeCurrency = (newCurrency) => async (dispatch, getState) => {
  try {
    // Get current state
    const state = getState();
    const { transactions, balance } = state.transactions;
    const preferences = loadUserPreferences();
    const oldCurrency = preferences.currency || 'KZT';

    if (oldCurrency === newCurrency) {
      // No need to convert if currency is the same
      console.log('Currency is already', newCurrency);
      return { success: false, message: 'Currency is already ' + newCurrency };
    }

    console.log(`Converting currency from ${oldCurrency} to ${newCurrency}`);
    console.log('Current balance:', balance);

    // Сначала проверяем, есть ли сохраненный курс для обратной конвертации
    let conversionRate = getSavedConversionRate(oldCurrency, newCurrency);
    let isUsingSavedRate = !!conversionRate;
    
    if (!conversionRate) {
      // Если нет сохраненного курса, получаем новый из API
      const balanceConversion = await convertCurrencyWithCurrentRate(1, oldCurrency, newCurrency);
      conversionRate = balanceConversion.rate;
      
      // Вычисляем обратный курс
      const reverseRate = 1 / conversionRate;
      
      // Сохраняем оба курса для будущей обратимости
      saveConversionRate(oldCurrency, newCurrency, conversionRate, reverseRate);
    }
    
    // Применяем конвертацию
    const convertedBalance = balance * conversionRate;
    
    // Для отображения пользователю применяем правильное округление
    let displayBalance;
    if (newCurrency === 'KZT' || newCurrency === 'RUB') {
      displayBalance = Math.round(convertedBalance);
    } else {
      displayBalance = Math.round(convertedBalance * 100) / 100;
    }
    
    console.log('Converted balance:', displayBalance);
    console.log('Using rate:', conversionRate);
    console.log('Using saved rate:', isUsingSavedRate);

    // Convert all transaction amounts using the SAME rate
    const convertedTransactions = transactions.map(transaction => {
      const convertedAmount = Number(transaction.amount) * conversionRate;
      
      // Применяем округление в зависимости от валюты
      let roundedAmount;
      if (newCurrency === 'KZT' || newCurrency === 'RUB') {
        roundedAmount = Math.round(convertedAmount);
      } else {
        roundedAmount = Math.round(convertedAmount * 100) / 100;
      }
      
      return {
        ...transaction,
        amount: roundedAmount
      };
    });

    // Save new currency preference
    const updatedPreferences = { ...preferences, currency: newCurrency };
    saveUserPreferences(updatedPreferences);

    // Update redux state with converted values
    dispatch(updateAllTransactionAmounts({
      transactions: convertedTransactions,
      balance: displayBalance
    }));

    console.log(`Currency successfully changed from ${oldCurrency} to ${newCurrency}`);
    console.log(`Balance converted from ${balance} to ${displayBalance}`);
    
    // Return conversion info for notification
    return {
      success: true,
      oldCurrency,
      newCurrency,
      rate: conversionRate,
      oldBalance: balance,
      newBalance: displayBalance,
      message: `Валюта изменена с ${oldCurrency} на ${newCurrency}`,
      isFallback: false,
      usedSavedRate: isUsingSavedRate
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    return {
      success: false,
      error: error.message || 'Произошла ошибка при конвертации валюты'
    };
  }
};