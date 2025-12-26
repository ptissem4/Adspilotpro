import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  id: string;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  description,
  value,
  onChange,
  options,
  id,
  error
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <select
          id={id}
          name={id}
          className={`block w-full rounded-md border-0 py-3 pl-4 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all cursor-pointer ${
            error
              ? 'text-red-900 ring-red-300 focus:ring-red-500 bg-red-50'
              : 'text-slate-900 ring-slate-300 focus:ring-indigo-600 bg-white'
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>Sélectionnez votre secteur</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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