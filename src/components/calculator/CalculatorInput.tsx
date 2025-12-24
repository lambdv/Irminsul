"use client";
import React from 'react';
import styles from './calculator.module.css';

type CalculatorInputProps = {
  label?: string;
  type?: 'text' | 'number' | 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function CalculatorInput({
  label,
  type = 'text',
  value,
  onChange,
  min,
  max,
  step,
  options,
  placeholder,
  disabled = false,
  className = '',
}: CalculatorInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (type === 'number') {
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue)) {
        onChange(numValue);
      } else if (e.target.value === '') {
        onChange(0);
      }
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      {type === 'select' && options ? (
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={styles.input}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className={styles.input}
        />
      )}
    </div>
  );
}


