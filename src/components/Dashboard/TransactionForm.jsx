// src/components/Dashboard/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction, updateTransaction } from '../../store/transactionSlice';
import { formatAmount } from '../../utils/formatters';

const TransactionForm = ({ onClose, transaction = null }) => {
  const [type, setType] = useState(transaction ? transaction.type : 'expense');
  const [amount, setAmount] = useState(transaction ? transaction.amount : '');
  const [categoryId, setCategoryId] = useState(transaction ? transaction.categoryId : '');
  const [date, setDate] = useState(
    transaction ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [comment, setComment] = useState(transaction ? transaction.comment || '' : '');
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  
  // Фильтруем категории по типу транзакции
  const filteredCategories = categories.filter(cat => cat.type === type);
  
  // Устанавливаем первую категорию из списка при изменении типа транзакции
  useEffect(() => {
    // Проверяем, есть ли выбранная категория в отфильтрованном списке
    const isCategoryValid = categoryId && filteredCategories.some(cat => cat.id === categoryId);
    
    // Устанавливаем категорию только если нет валидной категории
    if (!isCategoryValid && filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    } else if (filteredCategories.length === 0) {
      setCategoryId('');
    }
  }, [type, filteredCategories]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация
    if (!amount || !categoryId || !date) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (isNaN(amount) || Number(amount) <= 0) {
      setError('Сумма должна быть положительным числом');
      return;
    }
    
    const transactionData = {
      type,
      amount: Number(amount),
      categoryId,
      date,
      comment,
    };
    
    if (transaction) {
      // Обновление существующей транзакции
      dispatch(updateTransaction({
        ...transactionData,
        id: transaction.id,
      }));
    } else {
      // Добавление новой транзакции
      dispatch(addTransaction(transactionData));
    }
    
    onClose();
  };
  
  return (
    <div className="bg-white p-6 rounded-lg dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">
        {transaction ? 'Редактировать транзакцию' : 'Новая транзакция'}
      </h2>
      
      {error && <div className="bg-danger-light/10 text-danger border-l-4 border-danger p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 dark:text-gray-300">Тип транзакции</label>
          <div className="flex">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-l-lg border ${
                type === 'expense'
                  ? 'bg-danger text-white border-danger'
                  : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
              }`}
              onClick={() => setType('expense')}
            >
              Расход
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-r-lg border ${
                type === 'income'
                  ? 'bg-success text-white border-success'
                  : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
              }`}
              onClick={() => setType('income')}
            >
              Доход
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 dark:text-gray-300" htmlFor="amount">
            Сумма *
          </label>
          <input
            type="number"
            id="amount"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 dark:text-gray-300" htmlFor="category">
            Категория *
          </label>
          <select
            id="category"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="" disabled>
              Выберите категорию
            </option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 dark:text-gray-300" htmlFor="date">
            Дата *
          </label>
          <input
            type="date"
            id="date"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 dark:text-gray-300" htmlFor="comment">
            Комментарий
          </label>
          <textarea
            id="comment"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="2"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105"
          >
            {transaction ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;