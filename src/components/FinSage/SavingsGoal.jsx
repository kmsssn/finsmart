// src/components/FinSage/SavingsGoal.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaFlag, FaPiggyBank, FaEdit, FaCheck, FaTimes, FaAward } from 'react-icons/fa';
import { formatAmount } from '../../utils/formatters';
import { loadUserPreferences } from '../../utils/userPreferences';
import { convertCurrencyWithCurrentRate } from '../../utils/exchange-rate-api';

const SavingsGoal = () => {
  const [goal, setGoal] = useState(() => {
    const savedGoal = localStorage.getItem('savingsGoal');
    return savedGoal ? JSON.parse(savedGoal) : { 
      amount: 50000, 
      name: 'Финансовая подушка', 
      current: 0,
      currency: 'KZT' // Добавляем валюту цели
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState({ ...goal });
  const [showAnimation, setShowAnimation] = useState(false);
  const [tempAmount, setTempAmount] = useState(''); // Для правильной работы с инпутом
  const [isConverting, setIsConverting] = useState(false);
  
  const { balance } = useSelector((state) => state.transactions);
  const preferences = loadUserPreferences();
  const currentCurrency = preferences.currency || 'KZT';
  
  // Автоматически обновляем прогресс цели при изменении баланса
  useEffect(() => {
    if (!isConverting) {
      const prevCurrent = goal.current;
      // Финансовая подушка не может быть больше текущего баланса
      const newCurrent = Math.min(balance, goal.amount);
      
      // Обновляем только если значение изменилось
      if (newCurrent !== prevCurrent) {
        setGoal(prev => ({ ...prev, current: newCurrent }));
        
        // Показываем анимацию если был прогресс
        if (newCurrent > prevCurrent) {
          setShowAnimation(true);
          setTimeout(() => setShowAnimation(false), 2000);
        }
      }
    }
  }, [balance, goal.amount, isConverting]);
  
  // Конвертируем цель при изменении валюты
  useEffect(() => {
    const convertGoalCurrency = async () => {
      // Проверяем, нужна ли конвертация
      if (!goal.currency || goal.currency === currentCurrency) {
        // Если валюта цели не установлена, устанавливаем текущую
        if (!goal.currency) {
          const updatedGoal = { ...goal, currency: currentCurrency };
          setGoal(updatedGoal);
          localStorage.setItem('savingsGoal', JSON.stringify(updatedGoal));
        }
        return;
      }
      
      setIsConverting(true);
      
      try {
        console.log(`Converting goal from ${goal.currency} to ${currentCurrency}`);
        console.log('Original goal:', goal);
        
        // Конвертируем сумму цели
        const amountConversion = await convertCurrencyWithCurrentRate(
          goal.amount, 
          goal.currency, 
          currentCurrency
        );
        
        // Получаем текущий баланс после конвертации валюты
        const newCurrent = Math.min(balance, amountConversion.amount);
        
        // Обновляем цель с новой валютой и текущим балансом
        const convertedGoal = {
          ...goal,
          amount: amountConversion.amount,
          current: newCurrent,
          currency: currentCurrency
        };
        
        console.log('Converted goal:', convertedGoal);
        
        setGoal(convertedGoal);
        localStorage.setItem('savingsGoal', JSON.stringify(convertedGoal));
      } catch (error) {
        console.error('Error converting goal currency:', error);
      } finally {
        setIsConverting(false);
      }
    };

    // Добавляем небольшую задержку, чтобы дать время для обновления баланса
    const timer = setTimeout(convertGoalCurrency, 100);
    return () => clearTimeout(timer);
  }, [currentCurrency, balance]);
  
  // Сохраняем цель в localStorage при её изменении
  useEffect(() => {
    if (!isConverting) {
      localStorage.setItem('savingsGoal', JSON.stringify(goal));
    }
  }, [goal, isConverting]);
  
  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    // Преобразуем строку в число, но сохраняем реальное значение
    const amount = tempAmount === '' ? 0 : Number(tempAmount);
    
    // При установке новой суммы цели, текущий прогресс остаётся как min(balance, newAmount)
    const newCurrent = Math.min(balance, amount);
    
    setGoal({
      ...tempGoal,
      amount,
      current: newCurrent,
      currency: currentCurrency // Сохраняем текущую валюту
    });
    setIsEditing(false);
    setTempAmount(''); // Очищаем временное значение
  };
  
  const openEditModal = () => {
    setIsEditing(true);
    setTempGoal({ ...goal });
    // Устанавливаем значение без нуля
    setTempAmount(goal.amount === 0 ? '' : goal.amount.toString());
  };
  
  // Вычисляем процент выполнения цели
  const progress = goal.amount > 0 ? Math.min(Math.round((goal.current / goal.amount) * 100), 100) : 0;
  
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
              Сумма цели ({currentCurrency})
            </label>
            <input
              type="number"
              id="goal-amount"
              className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={tempAmount}
              onChange={(e) => setTempAmount(e.target.value)}
              min="0"
              step="0.01"
              placeholder="Введите сумму"
              required
            />
            <span className="text-sm text-gray-500 mt-1 block">
              Текущий баланс: {formatAmount(balance)}
            </span>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => {
                setIsEditing(false);
                setTempAmount('');
              }}
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
              onClick={openEditModal}
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
                  Осталось собрать: {formatAmount(Math.max(0, goal.amount - goal.current))}
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
          
          {goal.current > balance && (
            <div className="mt-3 p-2 bg-secondary-light/10 border border-secondary-light/30 rounded-lg text-xs text-secondary-dark">
              <strong>Внимание:</strong> Сумма в подушке превышает текущий баланс. Подушка будет скорректирована до текущего баланса.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavingsGoal;