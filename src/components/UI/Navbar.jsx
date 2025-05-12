import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { 
  FaHome, FaChartPie, FaTags, FaSignOutAlt, 
  FaUserCircle, FaBars, FaTimes, FaWallet, FaCog
} from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      dispatch(logout());
      navigate('/login');
    }
  };
  
  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-md py-2 dark:bg-gray-800/80' 
        : 'bg-gradient-to-r from-primary to-secondary py-3 dark:from-primary-dark dark:to-secondary-dark'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`transition-all duration-300 ${scrolled ? 'text-primary dark:text-primary-light' : 'text-white'}`}>
              <FaWallet size={24} className="mr-2" />
            </div>
            <h1 className={`text-xl font-bold transition-all duration-300 ${
              scrolled 
                ? 'bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text'
                : 'text-white'
            }`}>FinSmart</h1>
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md transition-colors ${
                scrolled 
                  ? 'text-primary hover:bg-primary/10 dark:text-primary-light' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `
                px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                  scrolled
                    ? isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    : isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                }
              `}
            >
              <FaHome className="mr-1" /> Главная
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) => `
                px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                  scrolled
                    ? isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    : isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                }
              `}
            >
              <FaChartPie className="mr-1" /> Статистика
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `
                px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-all duration-300 ${
                  scrolled
                    ? isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    : isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                }
              `}
            >
              <FaCog className="mr-1" /> Настройки
            </NavLink>
            
            <ThemeToggle />
            
            <div className="relative ml-3 group">
              <button className={`flex items-center text-sm font-medium ${
                scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
              } focus:outline-none transition-colors duration-300`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-1 overflow-hidden ${
                  scrolled ? 'bg-primary/10 dark:bg-primary/20' : 'bg-white/20'
                }`}>
                  <FaUserCircle className={scrolled ? 'text-primary dark:text-primary-light' : 'text-white'} size={20} />
                </div>
                <span>{user?.email ? user.email.split('@')[0] : 'Пользователь'}</span>
              </button>
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center"
                >
                  <FaSignOutAlt className="mr-2 text-red-500" /> Выход
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-60 opacity-100 pt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="flex flex-col space-y-2 pb-3">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `
                px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                  scrolled
                    ? isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    : isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                }
              `}
            >
              <FaHome className="mr-2" /> Главная
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) => `
                px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                  scrolled
                    ? isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    : isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                }
              `}
            >
              <FaChartPie className="mr-2" /> Статистика
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `
                px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                  scrolled
                    ? isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    : isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                }
              `}
            >
              <FaCog className="mr-2" /> Настройки
            </NavLink>
            <button
              onClick={handleLogout}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center w-full ${
                scrolled ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-white hover:bg-white/10'
              }`}
            >
              <FaSignOutAlt className="mr-2" /> Выход
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;