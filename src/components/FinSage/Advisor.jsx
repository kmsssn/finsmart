import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaLightbulb, FaChartLine, FaExclamationTriangle, FaRobot } from 'react-icons/fa';

const Advisor = () => {
  const [advice, setAdvice] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { transactions } = useSelector((state) => state.transactions);
  const { categories } = useSelector((state) => state.categories);
  
  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (!transactions.length) {
        setAdvice([{
          type: 'info',
          icon: <FaLightbulb className="text-primary" />,
          title: 'Начните отслеживать',
          message: 'Добавьте свои первые транзакции, чтобы получить персонализированные финансовые советы.',
        }]);
      } else {
        const generatedAdvice = generateAdvice();
        
        if (generatedAdvice.length === 0) {
          generatedAdvice.push({
            type: 'info',
            icon: <FaLightbulb className="text-primary" />,
            title: 'Финансовый анализ',
            message: 'Продолжайте отслеживать расходы. Чем больше данных, тем точнее будут рекомендации FinSage.',
          });
        }
        
        if (!generatedAdvice.some(a => a.title === 'Финансовая дисциплина')) {
          generatedAdvice.push({
            type: 'info',
            icon: <FaLightbulb className="text-primary" />,
            title: 'Финансовая дисциплина',
            message: 'Регулярно проверяйте свой бюджет. Это поможет вам замечать расходы, которые можно оптимизировать.',
          });
        }
        
        setAdvice(generatedAdvice);
      }
      setIsLoading(false);
    }, 800);
  }, [transactions, categories]);
  
  const generateAdvice = () => {
    const currentMonth = new Date().getMonth();
    const lastMonth = (currentMonth - 1 + 12) % 12;
    
    const currentMonthTransactions = transactions.filter(
      (t) => new Date(t.date).getMonth() === currentMonth
    );
    
    const lastMonthTransactions = transactions.filter(
      (t) => new Date(t.date).getMonth() === lastMonth
    );
    
    const totalCurrentIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalCurrentExpense = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalLastIncome = lastMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalLastExpense = lastMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expensesByCategory = {};
    
    currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (!expensesByCategory[t.categoryId]) {
          expensesByCategory[t.categoryId] = 0;
        }
        expensesByCategory[t.categoryId] += Number(t.amount);
      });
    
    const sortedCategoryIds = Object.keys(expensesByCategory).sort(
      (a, b) => expensesByCategory[b] - expensesByCategory[a]
    );
    
    const adviceList = [];
    
    if (totalLastIncome > 0) {
      const incomeChange = ((totalCurrentIncome - totalLastIncome) / totalLastIncome) * 100;
      
      if (incomeChange <= -10) {
        adviceList.push({
          type: 'warning',
          icon: <FaExclamationTriangle className="text-secondary" />,
          title: 'Снижение доходов',
          message: `Ваши доходы снизились на ${Math.abs(incomeChange).toFixed(1)}% по сравнению с прошлым месяцем. Рассмотрите дополнительные источники дохода.`,
        });
      } else if (incomeChange >= 10) {
        adviceList.push({
          type: 'success',
          icon: <FaChartLine className="text-success" />,
          title: 'Рост доходов',
          message: `Ваши доходы выросли на ${incomeChange.toFixed(1)}% по сравнению с прошлым месяцем. Отличная работа!`,
        });
      }
    }
    
    // 2. Анализ расходов
    if (totalCurrentIncome > 0 && (totalCurrentExpense / totalCurrentIncome) > 0.7) {
      adviceList.push({
        type: 'warning',
        icon: <FaExclamationTriangle className="text-secondary" />,
        title: 'Высокие расходы',
        message: `Вы тратите ${((totalCurrentExpense / totalCurrentIncome) * 100).toFixed(0)}% своего дохода. Рекомендуется тратить не более 70% дохода.`,
      });
    }
    
    if (sortedCategoryIds.length > 0) {
      const topCategoryId = sortedCategoryIds[0];
      const topCategory = categories.find((c) => c.id === topCategoryId);
      
      if (topCategory && totalCurrentIncome > 0) {
        const categoryPercentage = (expensesByCategory[topCategoryId] / totalCurrentIncome) * 100;
        
        if (categoryPercentage > 30) {
          adviceList.push({
            type: 'info',
            icon: <FaLightbulb className="text-primary" />,
            title: 'Крупная категория расходов',
            message: `Расходы на "${topCategory.name}" составляют ${categoryPercentage.toFixed(0)}% вашего дохода. Рассмотрите возможности экономии в этой категории.`,
          });
        }
      }
    }
    
    if (totalCurrentIncome > 0 && (totalCurrentIncome - totalCurrentExpense) < totalCurrentIncome * 0.2) {
      adviceList.push({
        type: 'info',
        icon: <FaLightbulb className="text-primary" />,
        title: 'Низкие накопления',
        message: 'Старайтесь откладывать не менее 20% от вашего ежемесячного дохода для создания финансовой подушки безопасности.',
      });
    }
    
    if (adviceList.length === 0 && totalCurrentExpense > 0) {
      const smallestCategoryId = sortedCategoryIds[sortedCategoryIds.length - 1];
      const smallestCategory = categories.find((c) => c.id === smallestCategoryId);
      
      if (smallestCategory) {
        adviceList.push({
          type: 'info',
          icon: <FaLightbulb className="text-primary" />,
          title: 'Эффективные траты',
          message: `Вы экономно тратите на категорию "${smallestCategory.name}". Продолжайте в том же духе!`,
        });
      }
    }
    
    return adviceList;
  };
  
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mr-4 shadow-lg">
            <FaRobot className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary">FinSage</h2>
          <p className="text-gray-600 text-sm">Умный финансовый ассистент</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Анализирую ваши финансы...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {advice.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl animate-slide-in ${
                item.type === 'warning'
                  ? 'bg-secondary-light/10 border-l-4 border-secondary'
                  : item.type === 'success'
                  ? 'bg-success-light/10 border-l-4 border-success'
                  : 'bg-primary-light/10 border-l-4 border-primary'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center mb-2">
                <span className="mr-2">{item.icon}</span>
                <h3 className="font-semibold">{item.title}</h3>
              </div>
              <p className="text-gray-700">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Advisor;