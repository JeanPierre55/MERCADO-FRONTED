import { CategoryInfo, ProductCategory } from '../../types'

interface CategoryFilterProps {
  categories: CategoryInfo[]
  selectedCategory: ProductCategory | 'all'
  onSelectCategory: (category: ProductCategory | 'all') => void
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelectCategory('all')}
        className="flex align-items-center gap-2 px-4 py-2 border-none cursor-pointer transition-all transition-duration-200"
        style={{
          backgroundColor: selectedCategory === 'all' 
            ? 'var(--pos-text-primary)' 
            : 'var(--pos-bg-secondary)',
          color: selectedCategory === 'all' 
            ? 'var(--pos-bg-secondary)' 
            : 'var(--pos-text-secondary)',
          borderRadius: '100px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          minWidth: 'fit-content',
          fontSize: '0.875rem',
          border: selectedCategory === 'all' 
            ? 'none' 
            : '1.5px solid var(--pos-border)',
          letterSpacing: '0.01em'
        }}
      >
        <span>Todos</span>
      </button>

      {categories.map((category) => {
        const isSelected = selectedCategory === category.id
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="flex align-items-center gap-2 px-4 py-2 border-none cursor-pointer transition-all transition-duration-200"
            style={{
              backgroundColor: isSelected 
                ? 'var(--pos-text-primary)' 
                : 'var(--pos-bg-secondary)',
              color: isSelected 
                ? 'var(--pos-bg-secondary)' 
                : 'var(--pos-text-secondary)',
              borderRadius: '100px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
              fontSize: '0.875rem',
              border: isSelected 
                ? 'none' 
                : '1.5px solid var(--pos-border)',
              letterSpacing: '0.01em'
            }}
          >
            <span>{category.name}</span>
          </button>
        )
      })}
    </div>
  )
}
