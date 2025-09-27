import React from 'react';
import './RubleIcon.css';

const RubleIcon = ({ size = 16, className = '' }) => {
  return (
    <span 
      className={`ruble-icon ${className}`}
      style={{ 
        width: size, 
        height: size, 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
      role="img" 
      aria-label="Рубль"
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 73 100" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text 
          x="50%" 
          y="62%" 
          fontFamily="Segoe UI, Roboto, Arial, sans-serif" 
          fontSize="72" 
          textAnchor="middle" 
          dominantBaseline="middle"
          fill="currentColor"
        >
          ₽
        </text>
      </svg>
    </span>
  );
};

export default RubleIcon;