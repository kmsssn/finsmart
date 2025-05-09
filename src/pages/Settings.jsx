import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { addCategory, updateCategory, deleteCategory } from '../store/categorySlice';
import { changeCurrency } from '../store/currencyActions';
import { FaPlus, FaEdit, FaTrash, FaTag, FaUser, FaMapMarkerAlt, FaGlobe, FaCalendarAlt, FaGlobeAsia } from 'react-icons/fa';
import Modal from '../components/UI/Modal';
import * as Icons from 'react-icons/fa';
import { loadUserPreferences, saveUserPreferences, setUserCountry } from '../utils/userPreferences';
import LocationSelector from '../components/UI/LocationSelector';
import CountrySelector from '../components/UI/CountrySelector';
import { COUNTRIES_WITH_CITIES } from '../components/UI/CountrySelector';


const Settings = () => {
  const { categories } = useSelector((state) => state.categories);
  const { transactions } = useSelector((state) => state.transactions);
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Check if we should activate the user tab from URL
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'user' ? 'user' : 'categories';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3490dc',
    icon: 'FaTag',
  });
  
  // User preferences
  const [userPreferences, setUserPreferences] = useState(loadUserPreferences());
  
  const iconList = [
    'FaHome', 'FaCar', 'FaUtensils', 'FaShoppingCart', 'FaBus',
    'FaPlane', 'FaGamepad', 'FaFilm', 'FaGraduationCap', 'FaMedkit',
    'FaWineGlass', 'FaTshirt', 'FaDog', 'FaMoneyBillAlt', 'FaLaptopCode',
    'FaGift', 'FaBook', 'FaMusic', 'FaHeart', 'FaCoffee',
    'FaBriefcase', 'FaDumbbell', 'FaCut', 'FaPiggyBank', 'FaTag',
  ];
  
  const colorOptions = [
    '#3490dc', // синий
    '#38a169', // зеленый
    '#e53e3e', // красный
    '#805ad5', // фиолетовый
    '#d69e2e', // желтый
    '#dd6b20', // оранжевый
    '#0694a2', // циан
    '#9f7aea', // лавандовый
    '#4c51bf', // индиго
  ];
  
  // Currencies
  const currencies = [
    { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге' },
    { code: 'USD', symbol: '$', name: 'Доллар США' },
    { code: 'EUR', symbol: '€', name: 'Евро' },
    { code: 'RUB', symbol: '₽', name: 'Российский рубль' }
  ];
  
  // Date formats
  const dateFormats = [
    { value: 'dd.MM.yyyy', label: 'ДД.ММ.ГГГГ', example: '31.12.2025' },
    { value: 'MM/dd/yyyy', label: 'ММ/ДД/ГГГГ', example: '12/31/2025' },
    { value: 'yyyy-MM-dd', label: 'ГГГГ-ММ-ДД', example: '2025-12-31' }
  ];
  
  // Открытие модального окна для создания новой категории
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'expense',
      color: '#3490dc',
      icon: 'FaTag',
    });
    setIsModalOpen(true);
  };
  
  // Открытие модального окна для редактирования категории
  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#3490dc',
      icon: category.icon || 'FaTag',
    });
    setIsModalOpen(true);
  };
  
  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Пожалуйста, введите название категории');
      return;
    }
    
    if (editingCategory) {
      // Обновление существующей категории
      dispatch(
        updateCategory({
          ...editingCategory,
          name: formData.name,
          type: formData.type,
          color: formData.color,
          icon: formData.icon,
        })
      );
    } else {
      // Создание новой категории
      dispatch(
        addCategory({
          name: formData.name,
          type: formData.type,
          color: formData.color,
          icon: formData.icon,
        })
      );
    }
    
    setIsModalOpen(false);
  };
  
  // Удаление категории
  const handleDelete = (categoryId) => {
    // Проверяем, используется ли категория в транзакциях
    const isUsed = transactions.some((t) => t.categoryId === categoryId);
    
    if (isUsed) {
      alert('Невозможно удалить категорию, так как она используется в транзакциях');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      dispatch(deleteCategory(categoryId));
    }
  };
  
  // Получение иконки по названию
  const IconComponent = ({ iconName, size = 20, color = 'currentColor' }) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon size={size} color={color} /> : <Icons.FaTag size={size} color={color} />;
  };
  
  // Обновление пользовательских настроек
  const updateUserPreferences = (key, value) => {
    const updatedPreferences = { ...userPreferences, [key]: value };
    setUserPreferences(updatedPreferences);
    saveUserPreferences(updatedPreferences);
  };
  
  return (
    <div className="max-w-6xl mx-auto animate-slide-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Настройки</h1>
          <p className="text-gray-600 dark:text-gray-400">Управляйте категориями и персональными настройками</p>
        </div>
        
        {activeTab === 'categories' && (
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105 hover:shadow-md"
          >
            <FaPlus className="mr-2" /> Новая категория
          </button>
        )}
      </div>
      
      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden mb-6 transition-all duration-300 hover:shadow-hover">
        <div className="flex border-b dark:border-gray-700">
          <button
            className={`flex items-center py-3 px-4 font-medium transition-all duration-300 ${
              activeTab === 'categories' 
                ? 'bg-primary text-white dark:bg-primary-dark shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            data-tab="categories"
            onClick={() => setActiveTab('categories')}
          >
            <FaTag className="mr-2" /> Категории
          </button>
          <button
            className={`flex items-center py-3 px-4 font-medium transition-all duration-300 ${
              activeTab === 'user' 
                ? 'bg-primary text-white dark:bg-primary-dark shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            data-tab="user"
            onClick={() => setActiveTab('user')}
          >
            <FaUser className="mr-2" /> Пользовательские настройки
          </button>
        </div>
      </div>
      
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden transition-all duration-300 hover:shadow-hover">
          <div className="flex border-b dark:border-gray-700">
            <button
              className={`flex-1 py-3 px-4 font-medium transition-all duration-300 ${
                formData.type === 'expense' 
                  ? 'bg-primary text-white dark:bg-primary-dark shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setFormData({ ...formData, type: 'expense' })}
            >
              Категории расходов
            </button>
            <button
              className={`flex-1 py-3 px-4 font-medium transition-all duration-300 ${
                formData.type === 'income' 
                  ? 'bg-primary text-white dark:bg-primary-dark shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setFormData({ ...formData, type: 'income' })}
            >
              Категории доходов
            </button>
          </div>
          
          {/* Список категорий */}
          <div className="p-6">
            {categories
              .filter((category) => category.type === formData.type)
              .map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 mb-2 border dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    borderLeftWidth: '4px',
                    borderLeftColor: category.color || '#3490dc'
                  }}
                >
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm"
                      style={{ backgroundColor: category.color || '#3490dc' }}
                    >
                      <IconComponent iconName={category.icon} color="white" />
                    </div>
                    <span className="font-medium dark:text-gray-300">{category.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-primary hover:bg-primary-light/20 rounded-full transition-colors"
                      title="Редактировать"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-secondary hover:bg-secondary-light/20 rounded-full transition-colors"
                      title="Удалить"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            
            {categories.filter((category) => category.type === formData.type).length === 0 && (
              <div className="text-center py-10 animate-slide-in">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <FaTag className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Нет категорий. Создайте свою первую категорию!
                </p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark inline-flex items-center transition-all duration-300 transform hover:scale-105"
                >
                  <FaPlus className="mr-2" /> Новая категория
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'user' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden transition-all duration-300 hover:shadow-hover">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Пользовательские настройки</h2>
            
            {/* Location settings */}
            <div className="mb-6 border-b pb-6 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4 flex items-center dark:text-gray-200">
                <FaMapMarkerAlt className="mr-2 text-primary" /> Местоположение
              </h3>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Город для погоды</label>
                <div className="flex items-center">
                  <LocationSelector
                    currentCity={userPreferences.city}
                    onCityChange={(city) => updateUserPreferences('city', city)}
                  />
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    Город используется для отображения погоды на главной странице
                  </span>
                </div>
              </div>
            </div>
            
            {/* Currency settings */}
            <div className="mb-6 border-b pb-6 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4 flex items-center dark:text-gray-200">
                <FaGlobe className="mr-2 text-primary" /> Валюта
              </h3>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Валюта по умолчанию</label>
                <select
                  value={userPreferences.currency}
                  onChange={(e) => updateUserPreferences('currency', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Date format settings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center dark:text-gray-200">
                <FaCalendarAlt className="mr-2 text-primary" /> Формат даты
              </h3>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Формат даты</label>
                <div className="space-y-2">
                  {dateFormats.map((format) => (
                    <label key={format.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value={format.value}
                        checked={userPreferences.dateFormat === format.value}
                        onChange={() => updateUserPreferences('dateFormat', format.value)}
                        className="form-radio text-primary focus:ring-primary dark:bg-gray-700"
                      />
                      <span className="dark:text-gray-300">
                        {format.label} <span className="text-gray-500 dark:text-gray-400 text-sm">({format.example})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно для создания/редактирования категории */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
                Название категории
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1b26] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Тип</label>
              <div className="flex">
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-l-lg border transition-all duration-300 ${
                    formData.type === 'expense'
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                >
                  Расход
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-r-lg border transition-all duration-300 ${
                    formData.type === 'income'
                      ? 'bg-success text-white border-success'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                >
                  Доход
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Цвет</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all duration-300 transform ${
                      formData.color === color 
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  ></button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Иконка</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:border-gray-600">
                {iconList.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      formData.icon === iconName
                        ? 'bg-primary text-white transform scale-110 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                  >
                    <IconComponent iconName={iconName} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                onClick={() => setIsModalOpen(false)}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105"
              >
                {editingCategory ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;