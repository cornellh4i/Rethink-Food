import React, { createContext, useContext, useState, useEffect } from "react";

interface FilterContextType {
  filters: Record<string, boolean>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  filteredDestinations: any[] | undefined;
  setFilteredDestinations: React.Dispatch<React.SetStateAction<any[] | undefined>>;
  isFilterActive: boolean;
  setIsFilterActive: React.Dispatch<React.SetStateAction<boolean>>;
  applyFilter: (filter: { type: string; value: any }) => void;
  resetFilters: () => void;
  clearAllFilters: () => void;
  closeSidebar: () => void;
  allDestinations: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBoroughs: string[];
  selectedRegion: string;
  selectedDistricts: string[];
  selectedCityCouncilDistricts: string[];
  selectedDietary: string[];
  selectedOtherFilters: string[];
  selectedPovertyThreshold: number;
  selectedCuisines: string[];
  selectedType: "Restaurant" | "CBO" | null;
  activeFilterCount: number;
  getFilteredCount: (params: any) => number;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<any[] | undefined>(undefined);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState<string>("New York City");
  const [selectedBoroughs, setSelectedBoroughs] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCityCouncilDistricts, setSelectedCityCouncilDistricts] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedOtherFilters, setSelectedOtherFilters] = useState<string[]>([]);
  const [selectedPovertyThreshold, setSelectedPovertyThreshold] = useState<number>(0);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<"Restaurant" | "CBO" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const closeSidebar = () => { setIsFilterActive(false); };
  
  // Fetch data
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
              cuisine: cboData.cuisine || [],
              meal_format: cboData.meal_format,
              annual_funding_goal: cboData.annual_funding_goal,
              quarter_funding_goal: cboData.quarter_funding_goal,
              congressional_district: cboData.congressional_district,
              city_council_district: cboData.city_council_district,
              percent_below_poverty_served: cboData.percent_below_poverty_served,
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

  // Apply filters whenever selections change
  useEffect(() => {
    filterData();
  }, [
    selectedRegion,
    selectedBoroughs, 
    selectedDistricts,
    selectedCityCouncilDistricts,
    selectedDietary,
    selectedOtherFilters,
    selectedPovertyThreshold,
    selectedCuisines,
    selectedType, 
    allDestinations,
    searchQuery
  ]);

  const applyFilter = (filter: { type: string; value: any }) => {
    setIsFilterActive(true);

    switch (filter.type) {
      case "region":
        setSelectedRegion(filter.value);
        // Clear district filters when changing regions
        if (filter.value !== "New York City") {
          setSelectedDistricts([]);
          setSelectedCityCouncilDistricts([]);
        }
        break;

      case "borough":
        // Toggle single borough
        const newBoroughs = selectedBoroughs.includes(filter.value)
          ? selectedBoroughs.filter(b => b !== filter.value)
          : [...selectedBoroughs, filter.value];
        setSelectedBoroughs(newBoroughs);
        break;

      case "boroughs":
        // Set multiple boroughs at once (from modal)
        setSelectedBoroughs(filter.value);
        break;

      case "district":
        // Toggle single district
        const newDistricts = selectedDistricts.includes(filter.value)
          ? selectedDistricts.filter(d => d !== filter.value)
          : [...selectedDistricts, filter.value];
        setSelectedDistricts(newDistricts);
        break;

      case "districts":
        // Set multiple districts at once (from modal)
        setSelectedDistricts(filter.value);
        break;

      case "cityCouncilDistricts":
        setSelectedCityCouncilDistricts(filter.value);
        break;

      case "dietary":
        setSelectedDietary(filter.value);
        break;

      case "otherFilters":
        setSelectedOtherFilters(filter.value);
        break;

      case "povertyThreshold":
        setSelectedPovertyThreshold(filter.value);
        break;

      case "cuisines":
        setSelectedCuisines(filter.value);
        break;

      case "orgType":
        // Toggle org type
        const newType = selectedType === filter.value ? null : filter.value;
        setSelectedType(newType);
        break;
    }
  };

  const filterData = () => {
    if (!Array.isArray(allDestinations)) return;

    let filtered = [...allDestinations];

    // Region filter
    if (selectedRegion === "New York City") {
      // NYC includes the 5 boroughs
      filtered = filtered.filter(dest => 
        ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"].includes(dest.borough)
      );
    } else if (selectedRegion === "Miami") {
      filtered = filtered.filter(dest => dest.borough === "Miami");
    }

    // Borough filter
    if (selectedBoroughs.length > 0) {
      filtered = filtered.filter(dest => selectedBoroughs.includes(dest.borough));
    }

    // Congressional District filter (NYC only)
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter(dest => {
        const district = dest.congressional_district;
        return district && selectedDistricts.includes(district.toString());
      });
    }

    // City Council District filter
    if (selectedCityCouncilDistricts.length > 0) {
      filtered = filtered.filter(dest => {
        const district = dest.city_council_district;
        return district && selectedCityCouncilDistricts.includes(district.toString());
      });
    }

    // Dietary Restrictions filter (Halal/Kosher from cuisine array)
    if (selectedDietary.length > 0) {
      filtered = filtered.filter(dest => {
        const cuisines = dest.cuisine || [];
        return selectedDietary.some(dietary => cuisines.includes(dietary));
      });
    }

    // Poverty Threshold filter
    if (selectedPovertyThreshold > 0) {
      filtered = filtered.filter(dest => {
        const povertyPercent = dest.percent_below_poverty_served;
        if (povertyPercent === null || povertyPercent === undefined) return false;
        
        // Threshold logic:
        // 25 -> show orgs with <= 25% poverty
        // 50 -> show orgs with <= 50% poverty
        // 75 -> show orgs with <= 75% poverty
        // 100 -> show orgs with <= 100% poverty
        return povertyPercent <= selectedPovertyThreshold;
      });
    }

    // Cuisine filter (excluding Halal/Kosher which are in dietary)
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(dest => {
        const cuisines = dest.cuisine || [];
        return selectedCuisines.some(cuisine => cuisines.includes(cuisine));
      });
    }

    // Other Filters
    if (selectedOtherFilters.includes("Serves Youth (0-18)")) {
      filtered = filtered.filter(dest => dest.program_serving_minors === true);
    }
    if (selectedOtherFilters.includes("Selective Distribution")) {
      filtered = filtered.filter(dest => dest.open_distribution === false);
    }

    // Organization Type filter
    if (selectedType) {
      filtered = filtered.filter(dest => {
        const orgType = dest.org_type?.toLowerCase();
        if (selectedType === "Restaurant") return orgType === "restaurant";
        if (selectedType === "CBO") return orgType === "cbo";
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(dest => 
        dest.name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredDestinations(filtered);
  };

  // Helper function to get filtered count with preview parameters
  const getFilteredCount = (params: any) => {
    if (!Array.isArray(allDestinations)) return 0;

    let filtered = [...allDestinations];

    // Region
    if (params.region === "New York City") {
      filtered = filtered.filter(dest => 
        ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"].includes(dest.borough)
      );
    } else if (params.region === "Miami") {
      filtered = filtered.filter(dest => dest.borough === "Miami");
    }

    // Boroughs
    if (params.boroughs?.length > 0) {
      filtered = filtered.filter(dest => params.boroughs.includes(dest.borough));
    }

    // Congressional Districts
    if (params.districts?.length > 0) {
      filtered = filtered.filter(dest => {
        const district = dest.congressional_district;
        return district && params.districts.includes(district.toString());
      });
    }

    // City Council Districts
    if (params.cityCouncilDistricts?.length > 0) {
      filtered = filtered.filter(dest => {
        const district = dest.city_council_district;
        return district && params.cityCouncilDistricts.includes(district.toString());
      });
    }

    // Dietary
    if (params.dietary?.length > 0) {
      filtered = filtered.filter(dest => {
        const cuisines = dest.cuisine || [];
        return params.dietary.some((dietary: string) => cuisines.includes(dietary));
      });
    }

    // Poverty
    if (params.povertyThreshold > 0) {
      filtered = filtered.filter(dest => {
        const povertyPercent = dest.percent_below_poverty_served;
        if (povertyPercent === null || povertyPercent === undefined) return false;
        return povertyPercent <= params.povertyThreshold;
      });
    }

    // Cuisines
    if (params.cuisines?.length > 0) {
      filtered = filtered.filter(dest => {
        const cuisines = dest.cuisine || [];
        return params.cuisines.some((cuisine: string) => cuisines.includes(cuisine));
      });
    }

    // Other Filters
    if (params.otherFilters?.includes("Serves Youth (0-18)")) {
      filtered = filtered.filter(dest => dest.program_serving_minors === true);
    }
    if (params.otherFilters?.includes("Selective Distribution")) {
      filtered = filtered.filter(dest => dest.open_distribution === false);
    }

    return filtered.length;
  };

  const resetFilters = () => {
    setSelectedRegion("New York City");
    setSelectedBoroughs([]);
    setSelectedDistricts([]);
    setSelectedCityCouncilDistricts([]);
    setSelectedDietary([]);
    setSelectedOtherFilters([]);
    setSelectedPovertyThreshold(0);
    setSelectedCuisines([]);
    setSelectedType(null);
    setFilters({});
    setSearchQuery("");
    setFilteredDestinations(allDestinations);
    setIsFilterActive(false);
  };

  const clearAllFilters = () => {
    setSelectedRegion("New York City");
    setSelectedBoroughs([]);
    setSelectedDistricts([]);
    setSelectedCityCouncilDistricts([]);
    setSelectedDietary([]);
    setSelectedOtherFilters([]);
    setSelectedPovertyThreshold(0);
    setSelectedCuisines([]);
    // Don't reset type and search in clear all
  };

  // Calculate active filter count
  const activeFilterCount = 
    selectedBoroughs.length +
    selectedDistricts.length +
    selectedCityCouncilDistricts.length +
    selectedDietary.length +
    selectedOtherFilters.length +
    selectedCuisines.length +
    (selectedPovertyThreshold > 0 ? 1 : 0) +
    (selectedRegion !== "New York City" ? 1 : 0);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        filteredDestinations,
        setFilteredDestinations,
        isFilterActive,
        setIsFilterActive,
        applyFilter,
        resetFilters,
        clearAllFilters,
        closeSidebar,
        allDestinations,
        searchQuery,
        setSearchQuery,
        selectedBoroughs,
        selectedRegion,
        selectedDistricts,
        selectedCityCouncilDistricts,
        selectedDietary,
        selectedOtherFilters,
        selectedPovertyThreshold,
        selectedCuisines,
        selectedType,
        activeFilterCount,
        getFilteredCount,
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