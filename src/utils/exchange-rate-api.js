
const API_KEY = '5b2c0943b88c5134e26983b9'; // Замените на ваш API ключ от ExchangeRate-API
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest/';

const FALLBACK_RATES = {
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
 * Get current exchange rates from API or fallback to static rates
 * @param {string} baseCurrency - Base currency code (KZT, USD, EUR, RUB)
 * @returns {Promise<Object>} Exchange rates object
 */
const getExchangeRates = async (baseCurrency) => {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    
    // Extract only the currencies we need
    const ourCurrencies = ['KZT', 'USD', 'EUR', 'RUB'];
    const filteredRates = {};
    
    ourCurrencies.forEach(currency => {
      if (data.rates[currency]) {
        filteredRates[currency] = data.rates[currency];
      }
    });
    
    return {
      base: baseCurrency,
      rates: filteredRates,
      lastUpdate: data.time_last_update_utc || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching exchange rates, using fallback rates:', error);
    
    // Return fallback rates
    return {
      base: baseCurrency,
      rates: FALLBACK_RATES[baseCurrency] || FALLBACK_RATES['KZT'],
      lastUpdate: 'fallback',
      isFallback: true
    };
  }
};

/**
 * Convert amount from one currency to another using current rates
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<{amount: number, rate: number, lastUpdate: string}>} Converted amount with rate info
 */
export const convertCurrencyWithCurrentRate = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return {
      amount: amount,
      rate: 1,
      lastUpdate: new Date().toISOString()
    };
  }
  
  try {
    // Get current rates for the source currency
    const exchangeData = await getExchangeRates(fromCurrency);
    
    if (!exchangeData.rates[toCurrency]) {
      throw new Error(`Rate not found for ${toCurrency}`);
    }
    
    const rate = exchangeData.rates[toCurrency];
    const convertedAmount = amount * rate;
    
    // Round based on currency type
    let roundedAmount;
    if (toCurrency === 'USD' || toCurrency === 'EUR') {
      roundedAmount = Math.round(convertedAmount * 100) / 100;
    } else {
      roundedAmount = Math.round(convertedAmount);
    }
    
    return {
      amount: roundedAmount,
      rate: rate,
      lastUpdate: exchangeData.lastUpdate,
      isFallback: exchangeData.isFallback || false
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw error;
  }
};

/**
 * Get display information about currency conversion
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<string>} Human-readable conversion info
 */
export const getCurrencyConversionInfo = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return 'Та же валюта';
  }
  
  try {
    const result = await convertCurrencyWithCurrentRate(1, fromCurrency, toCurrency);
    
    let info = `1 ${fromCurrency} = ${result.amount} ${toCurrency}`;
    
    if (result.isFallback) {
      info += ' (приблизительный курс)';
    } else {
      const date = new Date(result.lastUpdate);
      info += ` (обновлено ${date.toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      })})`;
    }
    
    return info;
  } catch (error) {
    console.error('Error getting conversion info:', error);
    return 'Не удалось получить курс обмена';
  }
};