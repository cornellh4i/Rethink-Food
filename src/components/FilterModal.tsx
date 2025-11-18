"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useFilter } from "@/context/FilterContext";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGIONS = ["NYC", "Miami", "Chicago"];
const BOROUGHS = ["Manhattan", "Queens", "Bronx", "Brooklyn", "Staten Island"];
const CONGRESSIONAL_DISTRICTS = ["1", "2", "3", "4", "5"];
const DIETARY_RESTRICTIONS = ["Halal", "Kosher"];

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const { applyFilter, selectedBoroughs, selectedType } = useFilter();
  const [selectedRegion, setSelectedRegion] = useState<string>("NYC");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleBorough = (borough: string) => {
    applyFilter(borough);
  };

  const toggleDistrict = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district)
        ? prev.filter((d) => d !== district)
        : [...prev, district]
    );
  };

  const toggleDietary = (dietary: string) => {
    setSelectedDietary((prev) =>
      prev.includes(dietary)
        ? prev.filter((d) => d !== dietary)
        : [...prev, dietary]
    );
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999]"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto z-[10000] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-black">Filter CBOs</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-black">Region</h3>
          <div className="flex gap-2 border border-gray-300 rounded-full p-1">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`flex-1 py-2 rounded-full transition-all duration-200 text-sm font-medium ${
                  selectedRegion === region
                    ? "bg-[#2D5F4F] text-white"
                    : "bg-transparent text-black hover:bg-gray-100"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-black">Boroughs</h3>
          <div className="flex flex-wrap gap-2">
            {BOROUGHS.map((borough) => (
              <button
                key={borough}
                onClick={() => toggleBorough(borough)}
                className={`px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium flex items-center gap-1 ${
                  selectedBoroughs.includes(borough)
                    ? "bg-[#A8D5BA] text-black"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                <span>{borough}</span>
                <span className="text-base font-bold">+</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-black">Congressional District</h3>
          <div className="flex flex-wrap gap-2">
            {CONGRESSIONAL_DISTRICTS.map((district) => (
              <button
                key={district}
                onClick={() => toggleDistrict(district)}
                className={`px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium flex items-center gap-1 ${
                  selectedDistricts.includes(district)
                    ? "bg-[#A8D5BA] text-black"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                <span>{district}</span>
                <span className="text-base font-bold">+</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-black">Dietary Restrictions</h3>
          <div className="flex flex-wrap gap-2">
            {DIETARY_RESTRICTIONS.map((dietary) => (
              <button
                key={dietary}
                onClick={() => toggleDietary(dietary)}
                className={`px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium flex items-center gap-1 ${
                  selectedDietary.includes(dietary)
                    ? "bg-[#A8D5BA] text-black"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                <span>{dietary}</span>
                <span className="text-base font-bold">+</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}