interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
}: CategoryTabsProps) {
  return (
    <nav className="w-full px-5 py-2.5 overflow-x-auto no-scrollbar flex gap-2 border-t border-surface-container/60">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              isActive
                ? "bg-gradient-to-r from-primary to-[#0284c7] text-white font-semibold shadow-sm shadow-primary/25"
                : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-medium border border-surface-container-highest/70"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </nav>
  );
}
