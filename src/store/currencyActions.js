// src/store/currencyActions.js
import { updateAllTransactionAmounts } from './transactionSlice';
import { convertCurrency } from '../utils/currencyConverter';
import { saveUserPreferences } from '../utils/userPreferences';

/**
 * Change currency and convert all amounts in transactions and balance
 * @param {string} newCurrency - New currency code (KZT, USD, EUR, RUB)
 * @returns {Function} Thunk action
 */
export const changeCurrency = (newCurrency) => (dispatch, getState) => {
  try {
    // Get current state
    const state = getState();
    const { transactions, balance } = state.transactions;
    const preferences = JSON.parse(localStorage.getItem('user_preferences')) || {};
    const oldCurrency = preferences.currency || 'KZT';

    if (oldCurrency === newCurrency) {
      // No need to convert if currency is the same
      return;
    }

    // Save new currency preference first
    saveUserPreferences({ ...preferences, currency: newCurrency });

    // Convert balance
    const convertedBalance = convertCurrency(balance, oldCurrency, newCurrency);

    // Convert all transaction amounts
    const convertedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: convertCurrency(transaction.amount, oldCurrency, newCurrency)
    }));

    // Update redux state with converted values
    dispatch(updateAllTransactionAmounts({
      transactions: convertedTransactions,
      balance: convertedBalance
    }));

    console.log(`Currency changed from ${oldCurrency} to ${newCurrency}. Balance converted.`);
  } catch (error) {
    console.error('Error converting currency:', error);
  }
};