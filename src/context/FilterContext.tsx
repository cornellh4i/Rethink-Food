import React, { createContext, useContext, useState, useEffect } from "react";

interface FilterContextType {
  filters: Record<string, boolean>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filteredDestinations: any[] | undefined;
  setFilteredDestinations: React.Dispatch<React.SetStateAction<any[] | undefined>>;
  isFilterActive: boolean;
  applyFilter: (key: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<any[] | undefined>(undefined);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Fetch all orgs (restaurants + CBOs) on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/organizations");
        const data = await res.json();
        const orgs = data.organizations || [];
        setAllDestinations(orgs);
        setFilteredDestinations(orgs);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };
    fetchData();
  }, []);

  const applyFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setIsFilterActive(true);

    if (!Array.isArray(allDestinations)) {
      console.warn("allDestinations is not an array yet");
      return;
    }

 

    if (key === "All") {
      setFilteredDestinations(allDestinations);
      return;
    }

    const filtered = allDestinations.filter((dest) => dest.borough === key);
    setFilteredDestinations(filtered);
  };

  const resetFilters = () => {
    setFilters({});
    setFilteredDestinations(allDestinations);
    setIsFilterActive(false);
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        filteredDestinations,
        setFilteredDestinations,
        isFilterActive,
        applyFilter,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilter must be used within a FilterProvider");
  return context;
};