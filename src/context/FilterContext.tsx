import React, { createContext, useContext, useState, useEffect } from "react";

interface FilterContextType {
  filters: Record<string, boolean>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filteredDestinations: any[] | undefined;
  setFilteredDestinations: React.Dispatch<React.SetStateAction<any[] | undefined>>;
  isFilterActive: boolean;
  applyFilter: (key: string) => void;
  resetFilters: () => void;
  closeSidebar: () => void;
  allDestinations: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBoroughs: string[];
  selectedType: "Restaurant" | "CBO" | null;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<any[] | undefined>(undefined);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [selectedBoroughs, setSelectedBoroughs] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<"Restaurant" | "CBO" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const closeSidebar = () => { setIsFilterActive(false); };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgsRes, cbosRes] = await Promise.all([
          fetch("/api/organizations"),
          fetch("/api/cbos")
        ]);

        const orgsData = await orgsRes.json();
        const cbosData = await cbosRes.json();

        const organizations = orgsData.organizations || [];
        const cbos = cbosData.cbos || [];

        const cboDataMap: Record<string, any> = {};
        cbos.forEach((cbo: any) => {
          cboDataMap[cbo.id] = cbo;
        });

        const mergedOrganizations = organizations.map((org: any) => {
          if (org.org_type === 'cbo' && cboDataMap[org.id]) {
            const cboData = cboDataMap[org.id];
            return {
              ...org,
              open_distribution: cboData.open_distribution,
              volunteer_opportunities: cboData.volunteer_opportunities,
              program_serving_minors: cboData.program_serving_minors,
              cuisine_preference: cboData.cuisine_preference,
              meal_format: cboData.meal_format,
              annual_funding_goal: cboData.annual_funding_goal,
              quarter_funding_goal: cboData.quarter_funding_goal,
              meal_count: cboData.meal_count !== undefined && cboData.meal_count !== null 
                ? cboData.meal_count 
                : (org.number_of_meals !== undefined && org.number_of_meals !== null ? org.number_of_meals : undefined),
              write_up: cboData.write_up && cboData.write_up.trim() 
                ? cboData.write_up 
                : (org.writeup && org.writeup.trim() ? org.writeup : undefined),
            };
          }
          return org;
        });

        setAllDestinations(mergedOrganizations);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };
    fetchData();
  }, []);

  // Apply search filter whenever searchQuery changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsFilterActive(true);
      filterData(selectedBoroughs, selectedType, searchQuery);
    } else {
      filterData(selectedBoroughs, selectedType, "");
    }
  }, [searchQuery, selectedBoroughs, selectedType, allDestinations]);

  const applyFilter = (key: string) => {
    setIsFilterActive(true);

    // Handle selecting borough - toggle in array
    if (["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"].includes(key)) {
      const newBoroughs = selectedBoroughs.includes(key)
        ? selectedBoroughs.filter(b => b !== key)
        : [...selectedBoroughs, key];
      
      setSelectedBoroughs(newBoroughs);
      
      // Auto-reset if all filters are deselected
      if (newBoroughs.length === 0 && !selectedType && !searchQuery.trim()) {
        setIsFilterActive(false);
        setFilteredDestinations(allDestinations);
        return;
      }
      
      filterData(newBoroughs, selectedType, searchQuery);
      return;
    }

    // Handle selecting restaurants/CBOs
    if (key === "Resturant" || key === "CBOS") {
      const newType =
        selectedType === (key === "Resturant" ? "Restaurant" : "CBO") 
          ? null 
          : key === "Resturant" ? "Restaurant" : "CBO";
      
      setSelectedType(newType);
      
      // Auto-reset if all filters are deselected
      if (selectedBoroughs.length === 0 && !newType && !searchQuery.trim()) {
        setIsFilterActive(false);
        setFilteredDestinations(allDestinations);
        return;
      }
      
      filterData(selectedBoroughs, newType, searchQuery);
      return;
    }

    // Reset to all
    if (key === "All" || key === "Boroughs" || key === "All Boroughs") {
      setSelectedBoroughs([]);
      setSelectedType(null);
      setFilters({});
      setSearchQuery("");
      setFilteredDestinations(allDestinations);
      return;
    }
  };

  const filterData = (boroughs: string[], type: "Restaurant" | "CBO" | null, search: string) => {
    if (!Array.isArray(allDestinations)) return;

    let filtered = [...allDestinations];

    if (boroughs.length > 0) {
      filtered = filtered.filter((dest) => boroughs.includes(dest.borough));
    }

    if (type) {
      filtered = filtered.filter((dest) => {
        const orgType = dest.org_type?.toLowerCase();
        if (type === "Restaurant") return orgType === "restaurant";
        if (type === "CBO") return orgType === "cbo";
        return true;
      });
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((dest) => {
        return dest.name?.toLowerCase().includes(searchLower);
      });
    }

    setFilteredDestinations(filtered);
  };

  const resetFilters = () => {
    setSelectedBoroughs([]);
    setSelectedType(null);
    setFilters({});
    setSearchQuery("");
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
      closeSidebar,
      allDestinations,
      searchQuery,
      setSearchQuery,
      selectedBoroughs,
      selectedType,
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