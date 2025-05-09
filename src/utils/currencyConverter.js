// src/utils/currencyConverter.js

// Exchange rates relative to KZT (Kazakhstani Tenge)
// 1 USD = ~476 KZT, 1 EUR = ~516 KZT, 1 RUB = ~5.27 KZT (as of May 2025)
const EXCHANGE_RATES = {
    KZT: {
      KZT: 1,
      USD: 0.0021, // 1 KZT = 0.0021 USD
      EUR: 0.0019, // 1 KZT = 0.0019 EUR
      RUB: 0.19    // 1 KZT = 0.19 RUB
    },
    USD: {
      KZT: 476,    // 1 USD = 476 KZT
      USD: 1,
      EUR: 0.92,   // 1 USD = 0.92 EUR
      RUB: 90.32   // 1 USD = 90.32 RUB
    },
    EUR: {
      KZT: 516,    // 1 EUR = 516 KZT
      USD: 1.09,   // 1 EUR = 1.09 USD
      EUR: 1,
      RUB: 98.17   // 1 EUR = 98.17 RUB
    },
    RUB: {
      KZT: 5.27,   // 1 RUB = 5.27 KZT
      USD: 0.011,  // 1 RUB = 0.011 USD
      EUR: 0.010,  // 1 RUB = 0.010 EUR
      RUB: 1
    }
  };
  
  /**
   * Convert amount from one currency to another
   * @param {number} amount - The amount to convert
   * @param {string} fromCurrency - Source currency code (KZT, USD, EUR, RUB)
   * @param {string} toCurrency - Target currency code (KZT, USD, EUR, RUB)
   * @returns {number} Converted amount
   */
  export const convertCurrency = (amount, fromCurrency, toCurrency) => {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    // Check if currencies are supported
    if (!EXCHANGE_RATES[fromCurrency] || !EXCHANGE_RATES[fromCurrency][toCurrency]) {
      console.error(`Conversion from ${fromCurrency} to ${toCurrency} not supported`);
      return amount;
    }
    
    // Apply conversion rate
    const convertedAmount = amount * EXCHANGE_RATES[fromCurrency][toCurrency];
    
    // Round to 2 decimal places for USD/EUR, 0 decimal places for KZT/RUB
    if (toCurrency === 'USD' || toCurrency === 'EUR') {
      return Math.round(convertedAmount * 100) / 100;
    } else {
      return Math.round(convertedAmount);
    }
  };