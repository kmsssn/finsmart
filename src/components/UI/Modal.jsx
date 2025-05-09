// components/UI/Modal.jsx
import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Блокировка прокрутки при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Обработка нажатия Escape для закрытия модального окна
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Если модальное окно закрыто, не рендерим ничего
  if (!isOpen) return null;
  
  // Обработчик клика по оверлею (закрытие модального окна)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-300"
      onClick={handleOverlayClick}
      style={{ 
        backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto transition-all duration-300"
        style={{
          opacity: isAnimating ? '1' : '0',
          transform: isAnimating ? 'translateY(0)' : 'translateY(20px)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;