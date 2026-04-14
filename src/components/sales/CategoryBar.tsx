import { useRef } from 'react';
import { motion } from 'framer-motion';

interface CategoryBarProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

// Map category keywords to emoji icons
const CATEGORY_ICONS: Record<string, string> = {
  masala: '🌶️',
  spice: '🌶️',
  flour: '🌾',
  atta: '🌾',
  maida: '🌾',
  besan: '🫘',
  gram: '🫘',
  grain: '🌽',
  rice: '🍚',
  dal: '🫘',
  lentil: '🫘',
  oil: '🫙',
  ghee: '🫙',
  sugar: '🍬',
  salt: '🧂',
  tea: '🍵',
  coffee: '☕',
  snack: '🍿',
  papad: '🫓',
  pickle: '🥒',
  achar: '🥒',
  sauce: '🍶',
  dry: '🥜',
  nut: '🥜',
  seed: '🌻',
  moraiyo: '🌿',
  ragi: '🌿',
  millet: '🌿',
  soji: '🌾',
  haldi: '💛',
  turmeric: '💛',
};

function getCategoryIcon(category: string): string {
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '📦';
}

export const CategoryBar = ({ categories, selected, onSelect }: CategoryBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const all = ['All', ...categories];

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto py-2 px-0 scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {all.map((cat) => {
        const isAll = cat === 'All';
        const isActive = isAll ? selected === null : selected === cat;
        return (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.88 }}
            onClick={() => onSelect(isAll ? null : cat)}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl border transition-all duration-150 text-xs font-semibold ${isActive
                ? 'bg-primary border-primary text-primary-foreground shadow-glow'
                : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
          >
            <span className="text-base leading-none" aria-hidden>
              {isAll ? '✨' : getCategoryIcon(cat)}
            </span>
            <span className="leading-none whitespace-nowrap" style={{ fontSize: '9px' }}>
              {cat.length > 10 ? cat.slice(0, 9) + '…' : cat}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
