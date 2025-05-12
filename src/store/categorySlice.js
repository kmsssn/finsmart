import { createSlice } from '@reduxjs/toolkit';

const defaultCategories = [
  { id: '1', name: 'Продукты', type: 'expense', color: '#3490dc', icon: 'FaShoppingCart' },
  { id: '2', name: 'Транспорт', type: 'expense', color: '#38a169', icon: 'FaBus' },
  { id: '3', name: 'Развлечения', type: 'expense', color: '#e53e3e', icon: 'FaGamepad' },
  { id: '4', name: 'Зарплата', type: 'income', color: '#3490dc', icon: 'FaMoneyBillAlt' },
  { id: '5', name: 'Фриланс', type: 'income', color: '#38a169', icon: 'FaLaptopCode' },
];

const initialState = {
  categories: JSON.parse(localStorage.getItem('categories')) || defaultCategories,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action) => {
      state.categories.push({ ...action.payload, id: Date.now().toString() });
      localStorage.setItem('categories', JSON.stringify(state.categories));
    },
    updateCategory: (state, action) => {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
        localStorage.setItem('categories', JSON.stringify(state.categories));
      }
    },
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(cat => cat.id !== action.payload);
      localStorage.setItem('categories', JSON.stringify(state.categories));
    },
  },
});

export const { addCategory, updateCategory, deleteCategory } = categorySlice.actions;
export default categorySlice.reducer;