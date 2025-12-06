"use client";

import { useFilter } from "@/context/FilterContext";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faSearch } from "@fortawesome/free-solid-svg-icons";
import FilterModal from "./FilterModal";

const RestCBOData = [
  {
    value: "Restaurant",
    label: "Restaurants",
    icon: "/fluent_food-20-filled.png",
    alt: "Food icon",
  },
  {
    value: "CBO",
    label: "CBOs",
    icon: "/formkit_people_black.png",
    alt: "People icon",
  },
];

const BOROUGHS = [
  "Bronx",
  "Brooklyn",
  "Manhattan",
  "Queens",
  "Staten Island",
];

export default function FilterBar() {
  const {
    applyFilter,
    resetFilters,
    searchQuery,
    setSearchQuery,
    selectedType,
    selectedBoroughs,
    setIsFilterActive,
    activeFilterCount
  } = useFilter();
  
  const [isBoroughDropdownOpen, setIsBoroughDropdownOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsFilterActive(true);
    }
  }, [searchQuery, setIsFilterActive]);

  const handleTypeFilterClick = (filterValue: string) => {
    applyFilter({ type: "orgType", value: filterValue });
  };

  const handleBoroughToggle = (borough: string) => {
    applyFilter({ type: "borough", value: borough });
  };

  const handleReset = () => {
    resetFilters();
  };

  const handleSortClick = () => {
    setIsFilterModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-6 py-3 rounded-full bg-[#E3E3E3] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 min-w-[338px]"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
          />
        </div>

        {/* Sort/Filter Modal Button */}
        <button onClick={handleSortClick} className="relative">
          <img src="/sort.png" alt="Sort icon" className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>
       
        {/* Borough Dropdown with Multi-Select Checkboxes */}
        <div className="relative">
          <button
            onClick={() => setIsBoroughDropdownOpen(!isBoroughDropdownOpen)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
              selectedBoroughs.length > 0
                ? "bg-[#5A5A5A] text-white"
                : "bg-[#E3E3E3] text-black hover:bg-gray-300"
            }`}
          >
            <span>Boroughs</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`w-3 h-3 transition-transform ${
                isBoroughDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isBoroughDropdownOpen && (
            <div className="absolute mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-50">
              {BOROUGHS.map((borough) => (
                <button
                  key={borough}
                  onClick={() => handleBoroughToggle(borough)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedBoroughs.includes(borough)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 bg-white"
                  }`}>
                    {selectedBoroughs.includes(borough) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-black">{borough}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Restaurant/CBO Toggle Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {RestCBOData.map(({ value, label, icon, alt }) => {
            const isActive = selectedType === value;
            
            return (
              <button
                key={value}
                onClick={() => handleTypeFilterClick(value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
                  isActive
                    ? value === "Restaurant"
                      ? "bg-green-500 text-white"
                      : "bg-blue-400 text-white"
                    : "bg-[#E3E3E3] text-black hover:bg-gray-300"
                }`}
              >
                <img src={icon} alt={alt} className="w-5 h-5" />
                <span>{label}</span>
              </button>
            );
          })}
          
        </div>
      </div>

      {isFilterModalOpen && (
        <FilterModal 
          isOpen={isFilterModalOpen} 
          onClose={() => setIsFilterModalOpen(false)} 
        />
      )}
    </>
  );
}