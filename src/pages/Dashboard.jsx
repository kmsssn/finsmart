// src/pages/Dashboard.jsx - updated layout
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Balance from '../components/Dashboard/Balance';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import TransactionForm from '../components/Dashboard/TransactionForm';
import Advisor from '../components/FinSage/Advisor';
import SavingsGoal from '../components/FinSage/SavingsGoal';
import Modal from '../components/UI/Modal';
import Button from '../components/UI/Button';
import WeatherDisplay from '../components/UI/WeatherDisplay';
import UserPreferencesSummary from '../components/UI/UserPreferencesSummary';
import { FaPlus, FaWallet } from 'react-icons/fa';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Эффект появления при первой загрузке
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);
  
  return (
    <div className="max-w-6xl mx-auto bg-gradient-fancy min-h-screen p-6">
      <div className={`mb-8 transition-all duration-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-4 shadow-lg">
              <FaWallet className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                Привет, {user?.email ? user.email.split('@')[0] : 'Пользователь'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Управляйте своими финансами эффективно и разумно</p>
            </div>
          </div>

          {/* Moved WeatherDisplay to its own div with high z-index */}
          <div className="z-[1000] relative">
            <WeatherDisplay />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная секция */}
        <div className="col-span-2">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 transition-all duration-700 delay-100 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Balance />
            <SavingsGoal />
          </div>
          
          <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl p-6 mb-6 transition-all duration-700 delay-200 transform hover:shadow-2xl ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-primary dark:text-primary-light">
                Последние транзакции
              </h2>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                icon={<FaPlus />}
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transform hover:scale-105 active:scale-95 rounded-xl"
              >
                Новая транзакция
              </Button>
            </div>
            <RecentTransactions />
          </div>
        </div>
        
        {/* Сайдбар с пониженным z-index */}
        <div className={`col-span-1 transition-all duration-700 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} z-10`}>
          <Advisor />
          <div className="mt-6">
            <UserPreferencesSummary />
          </div>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TransactionForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;