// src/utils/exchange-rate-api.js

const FALLBACK_RATES = {
  KZT: {
    KZT: 1,
    USD: 1/475.0,   // Очень точный курс: 1 USD = 475 KZT
    EUR: 1/510.0,   // 1 EUR = 510 KZT
    RUB: 1/5.12     // 1 RUB = 5.12 KZT
  },
  USD: {
    KZT: 475.0,     // 1 USD = 475 KZT
    USD: 1,
    EUR: 0.92,      // 1 USD = 0.92 EUR
    RUB: 92.7       // 1 USD = 92.7 RUB
  },
  EUR: {
    KZT: 510.0,     // 1 EUR = 510 KZT
    USD: 1.087,     // 1 EUR = 1.087 USD
    EUR: 1,
    RUB: 100.7      // 1 EUR = 100.7 RUB
  },
  RUB: {
    KZT: 5.12,      // 1 RUB = 5.12 KZT
    USD: 0.0108,    // 1 RUB = 0.0108 USD
    EUR: 0.0099,    // 1 RUB = 0.0099 EUR
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
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
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
      lastUpdate: data.date || new Date().toISOString(),
      isFallback: false
    };
  } catch (error) {
    console.warn('Error fetching exchange rates, using fallback rates:', error);
    
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
      amount: Number(amount),
      rate: 1,
      lastUpdate: new Date().toISOString(),
      isFallback: false
    };
  }
  
  try {
    // Get current rates for the source currency
    const exchangeData = await getExchangeRates(fromCurrency);
    
    if (!exchangeData.rates[toCurrency]) {
      throw new Error(`Rate not found for ${toCurrency}`);
    }
    
    const rate = exchangeData.rates[toCurrency];
    
    // Используем высокую точность для промежуточных вычислений
    const convertedAmount = Number(amount) * rate;
    
    // Применяем минимальное округление только для отображения
    let finalAmount;
    if (toCurrency === 'KZT' || toCurrency === 'RUB') {
      // Для валют с целыми числами храним с минимальной точностью
      finalAmount = Math.round(convertedAmount * 100) / 100;
    } else {
      // Для USD/EUR используем максимальную точность
      finalAmount = Math.round(convertedAmount * 100000000) / 100000000;
    }
    
    return {
      amount: finalAmount,
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
    
    // Форматируем курс с нужной точностью для отображения
    let formattedRate;
    if (result.amount > 100) {
      formattedRate = result.amount.toFixed(2);
    } else if (result.amount > 1) {
      formattedRate = result.amount.toFixed(4);
    } else {
      formattedRate = result.amount.toFixed(6);
    }
    
    let info = `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;
    
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