'use client'


import { useFilter } from '@/context/FilterContext';
import { useState } from 'react';

const TITLES = ['Neighborhood', 'Boroughs'];
const RestOrCBO = ["Resturant", "CBOS"];


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
        <div className="absolute top-50 md:top-26 left-4 z-10">
          <div className="flex gap-4 overflow-x-auto">
            <div className="flex gap-1">
              {TITLES.map((title) => (
                <button
                  key={title}
                  onClick={() => setFilter(title)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap shadow-sm ${
                    activeBorough === title
                      ? "bg-[#5A5A5A] text-white shadow-md"
                      : "bg-[#E3E3E3] text-black hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>

            <div className="flex gap-1">
              {RestOrCBO.map((title) => (
                <button
                  key={title}
                  onClick={() => setFilter(title)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap shadow-sm ${
                    activeBorough === title
                      ? "bg-[#5A5A5A] text-white shadow-md"
                      : "bg-[#E3E3E3] text-black hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
}