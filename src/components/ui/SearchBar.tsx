import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export default function SearchBar({
  placeholder = "Cari...",
  value,
  onChange,
  debounceMs = 300,
  className = "",
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
        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60'
        size={16}
      />
      <input
        type='text'
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className='flex w-full rounded-md border border-border-secondary/60 bg-background text-foreground shadow-sm px-3 py-2 pl-10 pr-4 text-sm md:text-base transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary/20 hover:border-border-secondary placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
      />
    </div>
  );
}
