// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { FaChartPie, FaLightbulb, FaPiggyBank, FaSignInAlt, FaWallet } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Запускаем анимации после загрузки компонента
    setIsAnimated(true);
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Простая валидация
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setIsLoading(true);
    
    // Имитация задержки загрузки для лучшего UX
    setTimeout(() => {
      // В реальном приложении здесь был бы запрос к API
      // Для демонстрации используем локальное хранилище
      const users = JSON.parse(localStorage.getItem('users')) || [];
      
      // Для демо-аккаунта
      if (email === 'demo@example.com' && password === 'demo123') {
        dispatch(login({ id: 'demo-user', email: 'demo@example.com' }));
        navigate('/dashboard');
        return;
      }
      
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        dispatch(login({ id: user.id, email: user.email }));
        navigate('/dashboard');
      } else {
        setError('Неверный email или пароль');
        setIsLoading(false);
      }
    }, 800);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Левая часть с иллюстрацией */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-gradient-middle to-secondary relative">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className={`p-12 max-w-xl transition-all duration-1000 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4 animate-float">
                <FaWallet className="text-white text-2xl" />
              </div>
              <h1 className="text-4xl font-bold text-white">FinSmart</h1>
            </div>
            <p className="text-xl text-white/90 mb-12">
              Умный помощник для управления вашими финансами
            </p>
            
            <div className="space-y-8">
              <div className={`flex items-center transition-all duration-700 ${isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4 shadow-glow">
                  <FaChartPie className="text-white" />
                </div>
                <p className="text-white/90">Наглядная статистика доходов и расходов</p>
              </div>
              
              <div className={`flex items-center transition-all duration-700 ${isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4 shadow-glow">
                  <FaLightbulb className="text-white" />
                </div>
                <p className="text-white/90">Умные рекомендации по оптимизации бюджета</p>
              </div>
              
              <div className={`flex items-center transition-all duration-700 ${isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`} style={{ transitionDelay: '600ms' }}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4 shadow-glow">
                  <FaPiggyBank className="text-white" />
                </div>
                <p className="text-white/90">Постановка и отслеживание финансовых целей</p>
              </div>
            </div>
            
            <div className="mt-12">
              <div className={`inline-block transition-all duration-1000 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
                <div className="text-white/60 text-sm backdrop-blur-md bg-white/10 rounded-lg p-4">
                  "FinSmart полностью изменил мой подход к личным финансам. Теперь я точно знаю, куда уходят мои деньги."
                  <div className="mt-2 font-medium">— Довольный пользователь</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Правая часть с формой входа */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-pastel-blue via-white to-pastel-pink p-6">
        <div className={`bg-white/80 backdrop-blur-md w-full max-w-md rounded-2xl shadow-card p-8 transition-all duration-1000 ${isAnimated ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="text-center mb-8">
            <div className="md:hidden flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <FaWallet className="text-white text-3xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">FinSmart</h2>
            <h3 className="text-xl font-medium text-gray-600 mt-2">Вход в кошелёк</h3>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-secondary text-secondary-dark p-4 rounded-lg mb-6 animate-slide-in">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="Введите ваш email"
                  className="w-full px-4 py-3 pl-10 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-600 mb-2 text-sm font-medium" htmlFor="password">
                Пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  placeholder="Введите ваш пароль"
                  className="w-full px-4 py-3 pl-10 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FaSignInAlt className="mr-2" />
              )}
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;