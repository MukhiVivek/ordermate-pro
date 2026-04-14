import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TRENDING_CHIPS = [
  'Mari Papad',
  'Besan',
  'Haldi',
  'Masala',
  'Maida',
  'Dhanajiru',
  'Ragi',
  'Soji',
];

export const SearchBar = ({ value, onChange, placeholder = 'Search products...' }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <motion.div
        className={`relative transition-all duration-200 ${isFocused ? 'shadow-glow' : ''}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-9 h-11 text-sm bg-muted border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Trending Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1.5 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <span className="flex-shrink-0 text-[10px] text-muted-foreground self-center font-medium pr-0.5">
          🔥
        </span>
        {TRENDING_CHIPS.map((chip) => (
          <motion.button
            key={chip}
            whileTap={{ scale: 0.88 }}
            onClick={() => onChange(chip)}
            className={`flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-150 ${value === chip
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
          >
            {chip}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};