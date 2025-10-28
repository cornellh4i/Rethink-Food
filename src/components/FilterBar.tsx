'use client'


import { useFilter } from '@/context/FilterContext';
import { useState } from 'react';

const BOROUGHS = ['All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];


export default function FilterBar({}){
    const { filters, applyFilter, isFilterActive} = useFilter(); 
    const [activeBorough, setActiveBorough] = useState("All")

    const setFilter = (borough: string) => {
          setActiveBorough(borough);
          applyFilter(borough);
    }

    

    return (
      <>
        {/* Filter buttons overlaid on the map */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex gap-2 overflow-x-auto">
            {BOROUGHS.map((borough) => (
              <button
                key={borough}
                onClick={() => setFilter(borough)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap shadow-sm ${
                  activeBorough === borough 
                    ? "bg-green-400 text-white shadow-md" 
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {borough}
              </button>
            ))}
          </div>
        </div>
      </>
    );
}