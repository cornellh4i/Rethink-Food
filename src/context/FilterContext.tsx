import React, { createContext, useContext, useState } from "react";

interface FilterContextType {
  filters: Record<string, boolean>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filteredDestinations: any[];
  setFilteredDestinations: React.Dispatch<React.SetStateAction<any[]>>;
  isFilterActive: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [filteredDestinations, setFilteredDestinations] = useState<any[]>([]);

  const isFilterActive = Object.values(filters).some(Boolean);

  return (
    <FilterContext.Provider value={{ filters, setFilters, filteredDestinations, setFilteredDestinations, isFilterActive }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilter must be used within a FilterProvider");
  return context;
};