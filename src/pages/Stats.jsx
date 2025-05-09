// src/pages/Stats.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { formatAmount, formatDate } from '../utils/formatters';

const Stats = () => {
  const { transactions } = useSelector((state) => state.transactions);
  const { categories } = useSelector((state) => state.categories);
  
  const [chartData, setChartData] = useState([]);
  const [expenseChartData, setExpenseChartData] = useState([]);
  const [incomeChartData, setIncomeChartData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [forecastData, setForecastData] = useState([]);
  
  // Цвета для диаграмм - используем наши обновленные цвета
  const COLORS = ['#36b37e', '#f7768e', '#7aa2f7', '#bb9af7', '#e0af68', '#ff9e64', '#1abc9c', '#c0caf5', '#565f89'];
  
  // Обработчик выбора периода
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };
  
  // Получение транзакций за выбранный период
  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return transactions.filter((t) => new Date(t.date) >= startDate);
  };
  
  // Подготовка данных для круговой диаграммы
  useEffect(() => {
    const filteredTransactions = getFilteredTransactions();
    
    // Группировка расходов по категориям
    const expensesByCategory = {};
    const incomesByCategory = {};
    
    filteredTransactions.forEach((transaction) => {
      const category = categories.find((c) => c.id === transaction.categoryId);
      if (!category) return;
      
      if (transaction.type === 'expense') {
        if (!expensesByCategory[category.id]) {
          expensesByCategory[category.id] = {
            name: category.name,
            value: 0,
            color: category.color,
          };
        }
        expensesByCategory[category.id].value += Number(transaction.amount);
      } else {
        if (!incomesByCategory[category.id]) {
          incomesByCategory[category.id] = {
            name: category.name,
            value: 0,
            color: category.color,
          };
        }
        incomesByCategory[category.id].value += Number(transaction.amount);
      }
    });
    
    // Преобразование в массив для диаграммы
    const expenseData = Object.values(expensesByCategory)
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: item.color || COLORS[index % COLORS.length],
      }));
    
    const incomeData = Object.values(incomesByCategory)
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        color: item.color || COLORS[index % COLORS.length],
      }));
    
    setExpenseChartData(expenseData);
    setIncomeChartData(incomeData);
    
    // Соединяем данные для общей круговой диаграммы
    const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);
    const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);
    
    setChartData([
      { name: 'Доходы', value: totalIncome, color: '#36b37e' }, // зеленый (как был)
      { name: 'Расходы', value: totalExpense, color: '#f7768e' }, // пастельный красный
    ]);
    
    // Подготовка данных для прогноза расходов
    prepareForecastData(filteredTransactions);
  }, [transactions, categories, selectedPeriod]);
  
  // Подготовка данных для прогноза расходов
  const prepareForecastData = (filteredTransactions) => {
    // Группируем транзакции по месяцам
    const expensesByMonth = {};
    
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((transaction) => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!expensesByMonth[monthKey]) {
          expensesByMonth[monthKey] = {
            month: new Date(date.getFullYear(), date.getMonth(), 1),
            value: 0,
          };
        }
        
        expensesByMonth[monthKey].value += Number(transaction.amount);
      });
    
    // Преобразуем в массив и сортируем по дате
    const monthlyExpenses = Object.values(expensesByMonth).sort(
      (a, b) => a.month - b.month
    );
    
    // Если есть данные за несколько месяцев, можем сделать простой прогноз
    if (monthlyExpenses.length >= 2) {
      const lastMonths = monthlyExpenses.slice(-3); // берем последние 3 месяца или меньше
      const avgMonthlyExpense = lastMonths.reduce((sum, item) => sum + item.value, 0) / lastMonths.length;
      
      // Создаем прогноз на следующие 3 месяца
      const lastMonth = new Date(monthlyExpenses[monthlyExpenses.length - 1].month);
      const forecast = [];
      
      for (let i = 1; i <= 3; i++) {
        const forecastMonth = new Date(lastMonth);
        forecastMonth.setMonth(lastMonth.getMonth() + i);
        
        forecast.push({
          month: forecastMonth,
          value: avgMonthlyExpense,
          isForecast: true,
        });
      }
      
      // Объединяем исторические данные и прогноз
      const forecastData = [
        ...monthlyExpenses.map((item) => ({ ...item, isForecast: false })),
        ...forecast,
      ];
      
      setForecastData(forecastData);
    } else {
      setForecastData([]);
    }
  };
  
  // Форматирование метки для графика
  const formatMonthLabel = (date) => {
    if (!(date instanceof Date)) {
      return '';
    }
    
    return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
  };
  
  // Настройка тултипа для круговой диаграммы
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <p className="font-medium dark:text-white">{payload[0].name}</p>
          <p className="text-primary dark:text-primary-light">{formatAmount(payload[0].value)}</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Финансовая статистика</h1>
        <p className="text-gray-600 dark:text-gray-400">Анализ ваших доходов и расходов</p>
      </div>
      
      {/* Выбор периода */}
      <div className="bg-white rounded-lg shadow-card p-6 mb-6 transition-all hover:shadow-hover dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Период анализа</h2>
          <div className="flex flex-wrap gap-2">
            {['week', 'month', 'quarter', 'year'].map((period, index) => (
              <button
                key={period}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'bg-primary text-white transform scale-105 shadow-md dark:bg-primary-dark'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                onClick={() => handlePeriodChange(period)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {period === 'week' && 'Неделя'}
                {period === 'month' && 'Месяц'}
                {period === 'quarter' && 'Квартал'}
                {period === 'year' && 'Год'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Основной анализ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Соотношение доходов и расходов */}
        <div className="bg-white rounded-lg shadow-md p-6 stats-card dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Доходы и расходы</h2>
          {chartData.length > 0 ? (
            <div className="h-64 chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10 dark:text-gray-400">
              Нет данных за выбранный период
            </p>
          )}
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
                <span className="dark:text-gray-300">Доходы:</span>
              </div>
              <span className="font-medium text-success">
                {formatAmount(chartData[0]?.value || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-danger rounded-full mr-2"></div>
                <span className="dark:text-gray-300">Расходы:</span>
              </div>
              <span className="font-medium text-danger">
                {formatAmount(chartData[1]?.value || 0)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Расходы по категориям */}
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Расходы по категориям</h2>
          {expenseChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10 dark:text-gray-400">
              Нет данных за выбранный период
            </p>
          )}
          <div className="mt-4 max-h-40 overflow-y-auto">
            {expenseChartData.map((category, index) => (
              <div key={index} className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="dark:text-gray-300">{category.name}</span>
                </div>
                <span className="font-medium dark:text-white">{formatAmount(category.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Прогноз расходов */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Прогноз расходов</h2>
        {forecastData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonthLabel}
                  stroke="#6B7280"
                />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  formatter={(value) => [formatAmount(value), 'Сумма']}
                  labelFormatter={(label) => formatMonthLabel(label)}
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#D1D5DB' }}
                />
                <Legend />
                <Bar
                  name="Исторические расходы"
                  dataKey={(data) => (data.isForecast ? null : data.value)}
                  fill="#f7768e" // Пастельный красный для расходов
                />
                <Bar
                  name="Прогноз расходов"
                  dataKey={(data) => (data.isForecast ? data.value : null)}
                  fill="#bb9af7" // Лавандовый для прогноза
                  pattern={
                    <pattern id="pattern-stripe" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                      <rect width="4" height="8" transform="translate(0,0)" fill="white"></rect>
                    </pattern>
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10 dark:text-gray-400">
            Недостаточно данных для прогноза. Добавьте больше транзакций.
          </p>
        )}
      </div>
    </div>
  );
};

export default Stats;