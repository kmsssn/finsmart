import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: JSON.parse(localStorage.getItem('transactions')) || [],
  balance: Number(JSON.parse(localStorage.getItem('balance')) || 0),
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action) => {
      const newTransaction = {
        ...action.payload,
        id: Date.now().toString(),
        date: action.payload.date || new Date().toISOString(),
        amount: Number(action.payload.amount)
      };
      
      state.transactions.push(newTransaction);
      
      // Обновление баланса с максимальной точностью
      if (newTransaction.type === 'income') {
        state.balance = Number((state.balance + newTransaction.amount).toFixed(8));
      } else {
        state.balance = Number((state.balance - newTransaction.amount).toFixed(8));
      }
      
      localStorage.setItem('transactions', JSON.stringify(state.transactions));
      localStorage.setItem('balance', JSON.stringify(state.balance));
    },
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      
      if (index !== -1) {
        // Откатываем эффект старой транзакции
        const oldTransaction = state.transactions[index];
        const oldAmount = Number(oldTransaction.amount);
        
        if (oldTransaction.type === 'income') {
          state.balance = Number((state.balance - oldAmount).toFixed(8));
        } else {
          state.balance = Number((state.balance + oldAmount).toFixed(8));
        }
        
        // Обновляем транзакцию
        state.transactions[index] = {
          ...action.payload,
          amount: Number(action.payload.amount)
        };
        
        const newAmount = Number(action.payload.amount);
        
        // Применяем эффект новой транзакции
        if (action.payload.type === 'income') {
          state.balance = Number((state.balance + newAmount).toFixed(8));
        } else {
          state.balance = Number((state.balance - newAmount).toFixed(8));
        }
        
        localStorage.setItem('transactions', JSON.stringify(state.transactions));
        localStorage.setItem('balance', JSON.stringify(state.balance));
      }
    },
    deleteTransaction: (state, action) => {
      const transaction = state.transactions.find(t => t.id === action.payload);
      
      if (transaction) {
        const amount = Number(transaction.amount);
        
        // Правильно откатываем эффект транзакции
        if (transaction.type === 'income') {
          // Если это был доход, ВЫЧИТАЕМ его из баланса
          state.balance = Number((state.balance - amount).toFixed(8));
        } else {
          // Если это был расход, ДОБАВЛЯЕМ его обратно к балансу
          state.balance = Number((state.balance + amount).toFixed(8));
        }
        
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
        localStorage.setItem('transactions', JSON.stringify(state.transactions));
        localStorage.setItem('balance', JSON.stringify(state.balance));
      }
    },
    updateAllTransactionAmounts: (state, action) => {
      // This action is used when updating currency to apply converted amounts
      // Храним с максимальной точностью все значения
      state.transactions = action.payload.transactions.map(transaction => ({
        ...transaction,
        amount: Number(transaction.amount)
      }));
      state.balance = Number(action.payload.balance);
      
      localStorage.setItem('transactions', JSON.stringify(state.transactions));
      localStorage.setItem('balance', JSON.stringify(state.balance));
    }
  },
});

export const { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  updateAllTransactionAmounts
} = transactionSlice.actions;

export default transactionSlice.reducer;