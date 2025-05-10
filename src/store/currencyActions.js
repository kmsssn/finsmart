// src/store/currencyActions.js
import { updateAllTransactionAmounts } from './transactionSlice';
import { convertCurrencyWithCurrentRate } from '../utils/exchange-rate-api';
import { saveUserPreferences, loadUserPreferences } from '../utils/userPreferences';

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
      return;
    }

    console.log(`Converting currency from ${oldCurrency} to ${newCurrency}`);
    console.log('Current balance:', balance);

    // Convert balance using current exchange rate
    const balanceConversion = await convertCurrencyWithCurrentRate(balance, oldCurrency, newCurrency);
    const convertedBalance = balanceConversion.amount;
    
    console.log('Converted balance:', convertedBalance);
    console.log('Using rate:', balanceConversion.rate);

    // Convert all transaction amounts using current rates
    const convertedTransactions = await Promise.all(transactions.map(async transaction => {
      const conversionResult = await convertCurrencyWithCurrentRate(
        Number(transaction.amount), 
        oldCurrency, 
        newCurrency
      );
      
      return {
        ...transaction,
        amount: conversionResult.amount
      };
    }));

    // Save new currency preference
    const updatedPreferences = { ...preferences, currency: newCurrency };
    saveUserPreferences(updatedPreferences);

    // Update redux state with converted values
    dispatch(updateAllTransactionAmounts({
      transactions: convertedTransactions,
      balance: convertedBalance
    }));

    console.log(`Currency changed from ${oldCurrency} to ${newCurrency}. Balance converted from ${balance} to ${convertedBalance}.`);
    
    // Return conversion info instead of showing alert
    return {
      success: true,
      oldCurrency,
      newCurrency,
      rate: balanceConversion.rate,
      isFallback: balanceConversion.isFallback
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};