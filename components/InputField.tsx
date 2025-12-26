import React from 'react';
import { Tooltip } from './Tooltip';

interface InputFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  id: string;
  error?: string;
  tooltip?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  description,
  value,
  onChange,
  placeholder,
  suffix,
  id,
  error,
  tooltip
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      
      <div className="relative rounded-md shadow-sm">
        <input
          type="number"
          name={id}
          id={id}
          step="0.01"
          className={`block w-full rounded-md border-0 py-3 pl-4 pr-12 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all ${
            error 
              ? 'text-red-900 ring-red-300 focus:ring-red-500 bg-red-50' 
              : 'text-slate-900 ring-slate-300 focus:ring-indigo-600 bg-white'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className={`${error ? 'text-red-500' : 'text-slate-500'} sm:text-sm font-medium`}>{suffix}</span>
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-600 font-medium animate-pulse">
          {error}
        </p>
      ) : description ? (
        <p className="text-xs text-slate-500 leading-tight">
          {description}
        </p>
      ) : null}
    </div>
  );
};