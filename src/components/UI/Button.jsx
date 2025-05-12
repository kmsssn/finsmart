import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  icon = null,
}) => {
  const baseClasses = 'font-medium rounded-lg focus:outline-none transition-all duration-300 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark hover:shadow-md active:transform active:scale-95',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark hover:shadow-md active:transform active:scale-95',
    success: 'bg-success text-white hover:bg-success-dark hover:shadow-md active:transform active:scale-95',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white hover:shadow-md active:transform active:scale-95',
    ghost: 'bg-transparent text-primary hover:bg-gray-100 active:transform active:scale-95',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClasses}
    ${disabledClasses}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;