// src/components/FinSage/SavingsGoal.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaFlag, FaPiggyBank, FaEdit, FaCheck, FaTimes, FaAward } from 'react-icons/fa';
import { formatAmount } from '../../utils/formatters';

const SavingsGoal = () => {
  const [goal, setGoal] = useState(() => {
    const savedGoal = localStorage.getItem('savingsGoal');
    return savedGoal ? JSON.parse(savedGoal) : { amount: 50000, name: 'Финансовая подушка', current: 0 };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState({ ...goal });
  const [showAnimation, setShowAnimation] = useState(false);
  
  const { balance } = useSelector((state) => state.transactions);
  
  // Автоматически обновляем прогресс цели при изменении баланса
  useEffect(() => {
    if (balance > 0) {
      const prevCurrent = goal.current;
      const newCurrent = Math.min(balance, goal.amount);
      setGoal(prev => ({ ...prev, current: newCurrent }));
      
      // Показываем анимацию если был прогресс
      if (newCurrent > prevCurrent) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 2000);
      }
    }
  }, [balance, goal.amount]);
  
  // Сохраняем цель в localStorage при её изменении
  useEffect(() => {
    localStorage.setItem('savingsGoal', JSON.stringify(goal));
  }, [goal]);
  
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setGoal(tempGoal);
    setIsEditing(false);
  };
  
  // Вычисляем процент выполнения цели
  const progress = Math.min(Math.round((goal.current / goal.amount) * 100), 100);
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
      {isEditing ? (
        <form onSubmit={handleEditSubmit}>
          <h2 className="text-xl font-semibold text-primary mb-4">Редактировать цель</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="goal-name">
              Название цели
            </label>
            <input
              type="text"
              id="goal-name"
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={tempGoal.name}
              onChange={(e) => setTempGoal({ ...tempGoal, name: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="goal-amount">
              Сумма цели
            </label>
            <input
              type="number"
              id="goal-amount"
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={tempGoal.amount}
              onChange={(e) => setTempGoal({ ...tempGoal, amount: Number(e.target.value) })}
              min="1000"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => setIsEditing(false)}
            >
              <FaTimes />
            </button>
            <button
              type="submit"
              className="p-2 rounded-full bg-gradient-primary text-white hover:shadow-md"
            >
              <FaCheck />
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center mr-3 shadow-md">
                <FaFlag className="text-white" size={18} />
              </div>
              <h2 className="text-xl font-semibold text-primary">Цель накопления</h2>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors"
            >
              <FaEdit size={18} />
            </button>
          </div>
          
          <div className="mb-3">
            <h3 className="text-lg font-semibold">{goal.name}</h3>
            <div className="flex justify-between items-center text-sm">
              <span>Прогресс: {progress}%</span>
              <span>
                {formatAmount(goal.current)} / {formatAmount(goal.amount)}
              </span>
            </div>
          </div>
          
          <div className="relative w-full bg-gray-200 rounded-full h-6 mb-4 overflow-hidden">
            <div
                className="bg-gradient-primary h-6 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
            {showAnimation && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
              </div>
            )}
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            {progress < 100 ? (
              <>
                <FaPiggyBank className="mr-2 text-primary" />
                <span>
                  Осталось собрать: {formatAmount(goal.amount - goal.current)}
                </span>
              </>
            ) : (
              <div className="w-full bg-success-light/20 p-3 rounded-xl flex items-center">
                <FaAward className="text-success mr-2" size={20} />
                <span className="text-success font-medium">
                  Цель достигнута! 🎉
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SavingsGoal;