import { versesByCategory } from '@/constants/versesByCategory'
import { CategorySelectorProps } from '@/interfaces/CategorySelectorProps'
import React from 'react'
import { Button } from './ui/button'

function CategorySelector({ onSelect, selectedCategory })  {
   <div className="grid grid-cols-2 gap-2 mb-4">
     {Object.keys(versesByCategory).map((category) => (
       <Button
         key={category}
         onClick={() => onSelect(category)}
         variant={selectedCategory === category ? "default" : "outline"}
         className="capitalize"
       >
         {category}
       </Button>
     ))}
   </div>
 
}

export default CategorySelector