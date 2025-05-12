import { loadUserPreferences } from './userPreferences';

export const formatAmount = (amount) => {
  const { currency } = loadUserPreferences();
  
  switch (currency) {
    case 'KZT':
      return new Intl.NumberFormat('kk-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
        currencyDisplay: 'symbol'
      }).format(amount).replace('KZT', '₸');
      
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
      
    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(amount);
      
    case 'RUB':
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(amount);
      
    default:
      return new Intl.NumberFormat('kk-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
        currencyDisplay: 'symbol'
      }).format(amount).replace('KZT', '₸');
  }
};
  
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const { dateFormat } = loadUserPreferences();
  
  switch (dateFormat) {
    case 'dd.MM.yyyy':
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
      
    case 'MM/dd/yyyy':
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
      
    case 'yyyy-MM-dd':
      return new Intl.DateTimeFormat('en-CA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
      
    default:
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
  }
};