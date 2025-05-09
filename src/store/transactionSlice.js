import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: JSON.parse(localStorage.getItem('transactions')) || [],
  balance: JSON.parse(localStorage.getItem('balance')) || 0,
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
      };
      
      state.transactions.push(newTransaction);
      
      // Обновление баланса
      if (newTransaction.type === 'income') {
        state.balance += Number(newTransaction.amount);
      } else {
        state.balance -= Number(newTransaction.amount);
      }
      
      localStorage.setItem('transactions', JSON.stringify(state.transactions));
      localStorage.setItem('balance', JSON.stringify(state.balance));
    },
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      
      if (index !== -1) {
        // Откатываем эффект старой транзакции
        if (state.transactions[index].type === 'income') {
          state.balance -= Number(state.transactions[index].amount);
        } else {
          state.balance += Number(state.transactions[index].amount);
        }
        
        // Обновляем транзакцию
        state.transactions[index] = action.payload;
        
        // Применяем эффект новой транзакции
        if (action.payload.type === 'income') {
          state.balance += Number(action.payload.amount);
        } else {
          state.balance -= Number(action.payload.amount);
        }
        
        localStorage.setItem('transactions', JSON.stringify(state.transactions));
        localStorage.setItem('balance', JSON.stringify(state.balance));
      }
    },
    deleteTransaction: (state, action) => {
      const transaction = state.transactions.find(t => t.id === action.payload);
      
      if (transaction) {
        // Откатываем эффект транзакции
        if (transaction.type === 'income') {
          state.balance -= Number(transaction.amount);
        } else {
          state.balance += Number(transaction.amount);
        }
        
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
        localStorage.setItem('transactions', JSON.stringify(state.transactions));
        localStorage.setItem('balance', JSON.stringify(state.balance));
      }
    },
    updateAllTransactionAmounts: (state, action) => {
      // This action is used when updating currency to apply converted amounts
      state.transactions = action.payload.transactions;
      state.balance = action.payload.balance;
      
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