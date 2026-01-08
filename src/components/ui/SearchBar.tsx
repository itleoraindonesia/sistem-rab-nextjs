import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Cari...',
  value,
  onChange,
  debounceMs = 300,
  className = ''
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle'
        size={16}
      />
      <input
        type='text'
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className='w-full pl-10 pr-4 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm md:text-base'
      />
    </div>
  );
}