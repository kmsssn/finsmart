// src/components/Dashboard/Balance.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatAmount } from '../../utils/formatters';

const Balance = () => {
  const { balance } = useSelector((state) => state.transactions);
  
  // Получаем месячные данные
  const monthlyData = useSelector((state) => {
    const currentMonth = new Date().getMonth();
    const incomes = state.transactions.transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = state.transactions.transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return { incomes, expenses };
  });
  
  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-md p-6 transition-all duration-300 hover:shadow-xl ${balance >= 0 ? 'border-l-4 border-success' : 'border-l-4 border-danger'}`}>
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${balance >= 0 ? 'bg-gradient-success' : 'bg-gradient-danger'}`}>
          {balance >= 0 ? (
            <FaArrowUp className="text-white" size={24} />
          ) : (
            <FaArrowDown className="text-white" size={24} />
          )}
        </div>
        <div>
          <h2 className="text-gray-600 mb-1">Текущий баланс</h2>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatAmount(balance)}
          </p>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <div className="w-2 h-6 bg-gradient-success rounded-full mr-2"></div>
            <span className="text-gray-600">Доходы (месяц):</span>
          </div>
          <span className="text-success font-semibold">
            {formatAmount(monthlyData.incomes)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-2 h-6 bg-gradient-danger rounded-full mr-2"></div>
            <span className="text-gray-600">Расходы (месяц):</span>
          </div>
          <span className="text-danger font-semibold">
            {formatAmount(monthlyData.expenses)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Balance;