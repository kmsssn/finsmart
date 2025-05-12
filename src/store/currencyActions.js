import { updateAllTransactionAmounts } from './transactionSlice';
import { convertCurrencyWithCurrentRate } from '../utils/exchange-rate-api';
import { saveUserPreferences, loadUserPreferences } from '../utils/userPreferences';

const saveConversionRate = (fromCurrency, toCurrency, rate, reversalRate) => {
  const key = `conversion_${fromCurrency}_${toCurrency}`;
  const reverseKey = `conversion_${toCurrency}_${fromCurrency}`;
  
  localStorage.setItem(key, JSON.stringify({
    rate: rate,
    timestamp: Date.now()
  }));
  
  localStorage.setItem(reverseKey, JSON.stringify({
    rate: reversalRate,
    timestamp: Date.now()
  }));
};

const getSavedConversionRate = (fromCurrency, toCurrency) => {
  const key = `conversion_${fromCurrency}_${toCurrency}`;
  const saved = localStorage.getItem(key);
  
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
      return parsed.rate;
    }
  }
  
  return null;
};

/**
 * @param {string} newCurrency 
 * @returns {Function}
 */
export const changeCurrency = (newCurrency) => async (dispatch, getState) => {
  try {
    const state = getState();
    const { transactions, balance } = state.transactions;
    const preferences = loadUserPreferences();
    const oldCurrency = preferences.currency || 'KZT';

    if (oldCurrency === newCurrency) {
      console.log('Currency is already', newCurrency);
      return { success: false, message: 'Currency is already ' + newCurrency };
    }

    console.log(`Converting currency from ${oldCurrency} to ${newCurrency}`);
    console.log('Current balance:', balance);

    let conversionRate = getSavedConversionRate(oldCurrency, newCurrency);
    let isUsingSavedRate = !!conversionRate;
    
    if (!conversionRate) {
      const balanceConversion = await convertCurrencyWithCurrentRate(1, oldCurrency, newCurrency);
      conversionRate = balanceConversion.rate;
      
      const reverseRate = 1 / conversionRate;
      
      saveConversionRate(oldCurrency, newCurrency, conversionRate, reverseRate);
    }
    
    const convertedBalance = balance * conversionRate;
    
    let displayBalance;
    if (newCurrency === 'KZT' || newCurrency === 'RUB') {
      displayBalance = Math.round(convertedBalance);
    } else {
      displayBalance = Math.round(convertedBalance * 100) / 100;
    }
    
    console.log('Converted balance:', displayBalance);
    console.log('Using rate:', conversionRate);
    console.log('Using saved rate:', isUsingSavedRate);

    const convertedTransactions = transactions.map(transaction => {
      const convertedAmount = Number(transaction.amount) * conversionRate;
      
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

    const updatedPreferences = { ...preferences, currency: newCurrency };
    saveUserPreferences(updatedPreferences);

    dispatch(updateAllTransactionAmounts({
      transactions: convertedTransactions,
      balance: displayBalance
    }));

    console.log(`Currency successfully changed from ${oldCurrency} to ${newCurrency}`);
    console.log(`Balance converted from ${balance} to ${displayBalance}`);
    
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