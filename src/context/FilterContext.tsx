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
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<any[] | undefined>(undefined);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"Restaurant" | "CBO" | null>(null);
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
        setFilteredDestinations(mergedOrganizations);
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
    if (key === "All" || key === "Boroughs" || key === "All Boroughs") {
      setSelectedBorough(null);
      setSelectedType(null);
      setFilters({});
      setFilteredDestinations(allDestinations);
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
      closeSidebar,
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