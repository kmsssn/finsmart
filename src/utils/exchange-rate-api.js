const FALLBACK_RATES = {
  KZT: {
    KZT: 1,
    USD: 1/475.0,   
    EUR: 1/510.0,   
    RUB: 1/5.12     
  },
  USD: {
    KZT: 475.0,     
    USD: 1,
    EUR: 0.92,      
    RUB: 92.7       
  },
  EUR: {
    KZT: 510.0,     
    USD: 1.087,     
    EUR: 1,
    RUB: 100.7      
  },
  RUB: {
    KZT: 5.12,      
    USD: 0.0108,    
    EUR: 0.0099,    
    RUB: 1
  }
};

/**
 * @param {string} baseCurrency
 * @returns {Promise<Object>}
 */
const getExchangeRates = async (baseCurrency) => {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    
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
    
    return {
      base: baseCurrency,
      rates: FALLBACK_RATES[baseCurrency] || FALLBACK_RATES['KZT'],
      lastUpdate: 'fallback',
      isFallback: true
    };
  }
};

/**
 * @param {number} amount
 * @param {string} fromCurrency 
 * @param {string} toCurrency
 * @returns {Promise<{amount: number, rate: number, lastUpdate: string}>} 
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
    const exchangeData = await getExchangeRates(fromCurrency);
    
    if (!exchangeData.rates[toCurrency]) {
      throw new Error(`Rate not found for ${toCurrency}`);
    }
    
    const rate = exchangeData.rates[toCurrency];
    
    const convertedAmount = Number(amount) * rate;
    
    let finalAmount;
    if (toCurrency === 'KZT' || toCurrency === 'RUB') {
      finalAmount = Math.round(convertedAmount * 100) / 100;
    } else {
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
 * @param {string} fromCurrency 
 * @param {string} toCurrency 
 * @returns {Promise<string>}
 */
export const getCurrencyConversionInfo = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return 'Та же валюта';
  }
  
  try {
    const result = await convertCurrencyWithCurrentRate(1, fromCurrency, toCurrency);
    
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