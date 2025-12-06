"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCircleInfo, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useFilter } from "@/context/FilterContext";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGIONS = ["NYC", "Miami"];
const BOROUGHS = ["Manhattan", "Queens", "Bronx", "Brooklyn", "Staten Island"];
const NYC_CONGRESSIONAL_DISTRICTS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 22];
const DIETARY_RESTRICTIONS = ["Halal", "Kosher"];
const OTHER_FILTERS = ["Serves Youth (0-18)", "Selective Distribution"];
const POVERTY_THRESHOLDS = [
  { value: 25, label: "<25% +" },
  { value: 50, label: "25% +" },
  { value: 75, label: "50% +" },
  { value: 100, label: "75% +" }
];

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const { 
    applyFilter, 
    clearAllFilters,
    selectedRegion,
    selectedBoroughs, 
    selectedDistricts,
    selectedCityCouncilDistricts,
    selectedDietary,
    selectedOtherFilters,
    selectedPovertyThreshold,
    selectedCuisines,
    allDestinations,
    getFilteredCount
  } = useFilter();
  
  const [localRegion, setLocalRegion] = useState<string>(selectedRegion || "NYC");
  const [localBoroughs, setLocalBoroughs] = useState<string[]>(selectedBoroughs);
  const [localDistricts, setLocalDistricts] = useState<string[]>(selectedDistricts);
  const [localCityCouncilDistricts, setLocalCityCouncilDistricts] = useState<string[]>(selectedCityCouncilDistricts);
  const [localDietary, setLocalDietary] = useState<string[]>(selectedDietary);
  const [localOtherFilters, setLocalOtherFilters] = useState<string[]>(selectedOtherFilters);
  const [localPovertyThreshold, setLocalPovertyThreshold] = useState<number>(selectedPovertyThreshold);
  const [localCuisines, setLocalCuisines] = useState<string[]>(selectedCuisines);
  const [cuisineInput, setCuisineInput] = useState("");
  const [selectedCityCouncilDistrictInput, setSelectedCityCouncilDistrictInput] = useState("");
  
  // Get unique cuisines from all destinations
  const availableCuisines = Array.from(
    new Set(
      allDestinations
        .flatMap(dest => dest.cuisine || [])
        .filter(c => c && !["Halal", "Kosher"].includes(c))
    )
  ).sort();

  useEffect(() => {
    setLocalRegion(selectedRegion || "NYC");
    setLocalBoroughs(selectedBoroughs);
    setLocalDistricts(selectedDistricts);
    setLocalCityCouncilDistricts(selectedCityCouncilDistricts);
    setLocalDietary(selectedDietary);
    setLocalOtherFilters(selectedOtherFilters);
    setLocalPovertyThreshold(selectedPovertyThreshold);
    setLocalCuisines(selectedCuisines);
  }, [selectedRegion, selectedBoroughs, selectedDistricts, selectedCityCouncilDistricts, selectedDietary, selectedOtherFilters, selectedPovertyThreshold, selectedCuisines]);

  if (!isOpen) return null;

  const toggleBorough = (borough: string) => {
    setLocalBoroughs(prev =>
      prev.includes(borough)
        ? prev.filter(b => b !== borough)
        : [...prev, borough]
    );
  };

  const toggleDistrict = (district: number) => {
    const districtStr = district.toString();
    setLocalDistricts(prev =>
      prev.includes(districtStr)
        ? prev.filter(d => d !== districtStr)
        : [...prev, districtStr]
    );
  };

  const toggleDietary = (dietary: string) => {
    setLocalDietary(prev =>
      prev.includes(dietary)
        ? prev.filter(d => d !== dietary)
        : [...prev, dietary]
    );
  };

  const toggleOtherFilter = (filter: string) => {
    setLocalOtherFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleCuisine = (cuisine: string) => {
    setLocalCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleApplyFilters = () => {
    // Apply all filters at once
    applyFilter({ type: "region", value: localRegion });
    applyFilter({ type: "boroughs", value: localBoroughs });
    applyFilter({ type: "districts", value: localDistricts });
    applyFilter({ type: "cityCouncilDistricts", value: localCityCouncilDistricts });
    applyFilter({ type: "dietary", value: localDietary });
    applyFilter({ type: "otherFilters", value: localOtherFilters });
    applyFilter({ type: "povertyThreshold", value: localPovertyThreshold });
    applyFilter({ type: "cuisines", value: localCuisines });
    onClose();
  };

  const handleClearFilters = () => {
    setLocalRegion("NYC");
    setLocalBoroughs([]);
    setLocalDistricts([]);
    setLocalCityCouncilDistricts([]);
    setLocalDietary([]);
    setLocalOtherFilters([]);
    setLocalPovertyThreshold(0);
    setLocalCuisines([]);
    clearAllFilters();
  };

  const removeBorough = (borough: string) => {
    setLocalBoroughs(prev => prev.filter(b => b !== borough));
  };

  const removeDistrict = (district: string) => {
    setLocalDistricts(prev => prev.filter(d => d !== district));
  };

  const removeCuisine = (cuisine: string) => {
    setLocalCuisines(prev => prev.filter(c => c !== cuisine));
  };

  // Calculate preview count based on local selections
  const previewCount = getFilteredCount({
    region: localRegion,
    boroughs: localBoroughs,
    districts: localDistricts,
    cityCouncilDistricts: localCityCouncilDistricts,
    dietary: localDietary,
    otherFilters: localOtherFilters,
    povertyThreshold: localPovertyThreshold,
    cuisines: localCuisines
  });

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999]"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto z-[10000] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-black">Filter CBOs</h2>

        {/* Region Selector */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-3 text-black">Region</h3>
          <div className="flex gap-0 border-2 border-gray-300 rounded-full p-1">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setLocalRegion(region)}
                className={`flex-1 py-2 px-4 rounded-full transition-all duration-200 text-sm font-medium ${
                  localRegion === region
                    ? "bg-[#2D5F4F] text-white"
                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Boroughs */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-3 text-black">Boroughs</h3>
          <div className="flex flex-wrap gap-2">
            {BOROUGHS.map((borough) => {
              const isSelected = localBoroughs.includes(borough);
              return (
                <button
                  key={borough}
                  onClick={() => toggleBorough(borough)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#A8D5BA] text-black"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <span>{borough}</span>
                  {isSelected ? (
                    <span className="text-lg font-bold">×</span>
                  ) : (
                    <span className="text-lg font-normal">+</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Congressional Districts */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-3 text-black">Congressional Districts</h3>
          
          {/* Selected Districts */}
          {localDistricts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {localDistricts.map((district) => (
                <button
                  key={district}
                  onClick={() => removeDistrict(district)}
                  className="px-4 py-2 rounded-full bg-[#A8D5BA] text-black text-sm font-medium flex items-center gap-2"
                >
                  <span>{district}</span>
                  <span className="text-lg font-bold">×</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Dropdown */}
          <div className="relative">
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  toggleDistrict(parseInt(e.target.value));
                }
              }}
            >
              <option value="">Select a district</option>
              {NYC_CONGRESSIONAL_DISTRICTS.map((district) => (
                <option 
                  key={district} 
                  value={district}
                  disabled={localDistricts.includes(district.toString())}
                >
                  District {district}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            />
          </div>
        </div>

        {/* City Council Districts */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-3 text-black">City Council Districts</h3>
          <div className="relative">
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              value={selectedCityCouncilDistrictInput}
              onChange={(e) => setSelectedCityCouncilDistrictInput(e.target.value)}
            >
              <option value="">Select a district</option>
              {Array.from({ length: 51 }, (_, i) => i + 1).map((district) => (
                <option key={district} value={district}>
                  District {district}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            />
          </div>
        </div>

        {/* Poverty Level Slider */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold text-black">
              Percentage of people served under poverty line
            </h3>
            <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="relative pt-6 pb-2">
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={POVERTY_THRESHOLDS.findIndex(t => t.value === localPovertyThreshold) !== -1 
                ? POVERTY_THRESHOLDS.findIndex(t => t.value === localPovertyThreshold) 
                : 0}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                setLocalPovertyThreshold(POVERTY_THRESHOLDS[index].value);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              style={{
                background: `linear-gradient(to right, 
                  #2D5F4F 0%, 
                  #2D5F4F ${(POVERTY_THRESHOLDS.findIndex(t => t.value === localPovertyThreshold) / 3) * 100}%, 
                  #E5E7EB ${(POVERTY_THRESHOLDS.findIndex(t => t.value === localPovertyThreshold) / 3) * 100}%, 
                  #E5E7EB 100%)`
              }}
            />
            
            <div className="flex justify-between mt-2 px-1">
              {POVERTY_THRESHOLDS.map((threshold) => (
                <span key={threshold.value} className="text-xs text-gray-600 font-medium">
                  {threshold.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cuisine */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-3 text-black">Cuisine</h3>
          
          {/* Selected Cuisines */}
          {localCuisines.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {localCuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => removeCuisine(cuisine)}
                  className="px-4 py-2 rounded-full bg-[#A8D5BA] text-black text-sm font-medium flex items-center gap-2"
                >
                  <span>{cuisine}</span>
                  <span className="text-lg font-bold">×</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="relative">
            <input
              type="text"
              placeholder="Type a cuisine"
              value={cuisineInput}
              onChange={(e) => setCuisineInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <FontAwesomeIcon
              icon={faChevronDown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            />
            
            {cuisineInput && (
              <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                {availableCuisines
                  .filter(c => c.toLowerCase().includes(cuisineInput.toLowerCase()))
                  .map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => {
                        toggleCuisine(cuisine);
                        setCuisineInput("");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    >
                      {cuisine}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-3 text-black">Dietary Restrictions</h3>
          <div className="flex flex-wrap gap-2">
            {DIETARY_RESTRICTIONS.map((dietary) => {
              const isSelected = localDietary.includes(dietary);
              return (
                <button
                  key={dietary}
                  onClick={() => toggleDietary(dietary)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#A8D5BA] text-black"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <span>{dietary}</span>
                  {isSelected ? (
                    <span className="text-lg font-bold">×</span>
                  ) : (
                    <span className="text-lg font-normal">+</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Other Filters */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-3 text-black">Other Filters</h3>
          <div className="flex flex-wrap gap-2">
            {OTHER_FILTERS.map((filter) => {
              const isSelected = localOtherFilters.includes(filter);
              return (
                <button
                  key={filter}
                  onClick={() => toggleOtherFilter(filter)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#A8D5BA] text-black"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <span>{filter}</span>
                  {isSelected ? (
                    <span className="text-lg font-bold">×</span>
                  ) : (
                    <span className="text-lg font-normal">+</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleClearFilters}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Clear Filters
          </button>
          
          <button
            onClick={handleApplyFilters}
            className="px-6 py-3 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
          >
            Show {previewCount} Partners
          </button>
        </div>
      </div>
    </>
  );
}