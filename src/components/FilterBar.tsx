"use client";

import { useFilter } from "@/context/FilterContext";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const RestCBOData = [
  {
    value: "Resturant",
    label: "Restaurants",
    icon: "/fluent_food-20-filled.png",
    alt: "Food icon",
  },
  {
    value: "CBOS",
    label: "CBOs",
    icon: "/formkit_people.png",
    alt: "People icon",
  },
];
const BOROUGHS = [
  "All Boroughs",
  "Bronx",
  "Brooklyn",
  "Manhattan",
  "Queens",
  "Staten Island",
];
const NEIGHBORHOODS = [
  "All Neighborhoods",
  "Neighborhood 1",
  "Neighborhood 2",
  "Neighborhood 3",
  "Neighborhood 4",
  "Neighborhood 5",
];

export default function FilterBar({}) {
  const { applyFilter } = useFilter();
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [isBoroughDropdownOpen, setIsBoroughDropdownOpen] = useState(false);
  const [isNeighborhoodDropdownOpen, setIsNeighborhoodDropdownOpen] =
    useState(false);
  const [selectedBorough, setSelectedBorough] = useState("Boroughs");

  const handleTypeFilterClick = (filterValue: string) => {
    if (activeTypeFilter === filterValue) {
      setActiveTypeFilter(null);
      applyFilter(filterValue); // This will toggle it off
    } else {
      setActiveTypeFilter(filterValue);
      applyFilter(filterValue);
    }
  };

  const handleBoroughSelect = (borough: string) => {
    setSelectedBorough(borough);
    setIsBoroughDropdownOpen(false);
    if (borough === "Boroughs") {
      applyFilter("All");
    } else {
      applyFilter(borough);
    }
  };

  useEffect(() => {
    applyFilter("All");
  }, []);

  return (
    <>
      <div className="absolute top-10 left-4 z-10">
        <div className="flex flex-wrap gap-4">
         
            <div className="relative">
              <button
                onClick={() => setIsBoroughDropdownOpen(!isBoroughDropdownOpen)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
                  selectedBorough !== "Boroughs"
                    ? "bg-[#5A5A5A] text-white"
                    : "bg-[#E3E3E3] text-black hover:bg-gray-300"
                }`}
              >
                <span>{selectedBorough}</span>
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
                      onClick={() => handleBoroughSelect(borough)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      {borough}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  setIsNeighborhoodDropdownOpen(!isNeighborhoodDropdownOpen)
                }
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#E3E3E3] text-black hover:bg-gray-300 transition-all duration-200"
              >
                <span>Neighborhoods</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`w-3 h-3 transition-transform ${
                    isNeighborhoodDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isNeighborhoodDropdownOpen && (
                <div className="absolute mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                  {NEIGHBORHOODS.map((neighborhood) => (
                    <button
                      key={neighborhood}
                      onClick={() => {
                        setIsNeighborhoodDropdownOpen(false);
                        // No filtering logic for neighborhoods yet
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      {neighborhood}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {RestCBOData.map(({ value, label, icon, alt }) => (
                <button
                  key={value}
                  onClick={() => handleTypeFilterClick(value)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
                    activeTypeFilter === value
                      ? "bg-[#5A5A5A] text-white"
                      : "bg-[#E3E3E3] text-black hover:bg-gray-300"
                  }`}
                >
                  <img src={icon} alt={alt} className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
         
        </div>
      </div>
    </>
  );
}