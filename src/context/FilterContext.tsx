import React, { createContext, useContext, useState, useEffect } from "react";

interface FilterContextType {
  filters: Record<string, boolean>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filteredDestinations: any[] | undefined;
  setFilteredDestinations: React.Dispatch<React.SetStateAction<any[] | undefined>>;
  isFilterActive: boolean;
  applyFilter: (key: string) => void;
  resetFilters: () => void;
  allDestinations: any[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<any[] | undefined>(undefined);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"Restaurant" | "CBO" | null>(null);
  

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
    setIsFilterActive(true);

    // Handle selecting borough
    if (["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"].includes(key)) {
      const newBorough = selectedBorough === key ? null : key;
      setSelectedBorough(newBorough);
      filterData(newBorough, selectedType);
      return;
    }

    // Handle selecting restaurants/CBOs
    if (key === "Resturant" || key === "CBOS") {
      // only one can be active
      const newType =
        selectedType === (key === "Resturant" ? "Restaurant" : "CBO") ? null : key === "Resturant" ? "Restaurant" : "CBO";
      setSelectedType(newType);
      filterData(selectedBorough, newType);
      return;
    }

    // Reset to all
    if (key === "All" || key === "Boroughs") {
      resetFilters();
      return;
    }
  };

  const filterData = (borough: string | null, type: "Restaurant" | "CBO" | null) => {
    if (!Array.isArray(allDestinations)) return;

    let filtered = [...allDestinations];

    if (borough) {
      filtered = filtered.filter((dest) => dest.borough === borough);
    }

    if (type) {
      filtered = filtered.filter((dest) => {
        const orgType = dest.org_type?.toLowerCase();
        if (type === "Restaurant") return orgType === "restaurant";
        if (type === "CBO") return orgType === "cbo";
        return true;
      });
    }

    setFilteredDestinations(filtered);
  };

  const resetFilters = () => {
    setSelectedBorough(null);
    setSelectedType(null);
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
        allDestinations,
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
