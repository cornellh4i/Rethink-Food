'use client'
import { Organization } from "@/app/page";
import { X } from "lucide-react";
import RestaurantDetailPopup from "./RestaurantDetailPopup";
import CBODetailPopup from "./CBODetailPopup";
import { useEffect, useRef, useState } from "react";

export default function OrganizationDetailPopup({
  org,
  onClose,
  onCBOIdSelect,
}: {
  org: Organization;
  onClose: () => void;
  onCBOIdSelect?: (cboId: number) => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [cboData, setCboData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);

  // Fetch CBO-specific data when org changes
  useEffect(() => {
    if (org.org_type === 'cbo') {
      const fetchCBOData = async () => {
        try {
          const res = await fetch("/api/cbos");
          const data = await res.json();
          const cboInfo = data.cbos.find((c: any) => c.id === org.id);
          setCboData(cboInfo || null);
        } catch (e) {
          console.error("Error fetching CBO data:", e);
        }
      };
      fetchCBOData();
    }
  }, [org]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!org) return null;

  return (
    <>
        {/* Click-outside area — covers everything to the right of 300px */}
         <div
        className="fixed top-0 right-0 h-full z-40"
        style={{ left: "500px" }}
        onClick={onClose}
          />

      {/* actual popup, stays in normal layout position */}
      <div
        ref={popupRef}
        className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 relative max-h-[80vh] overflow-y-auto w-[340px] z-50"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white rounded-full p-1 text-gray-600 hover:text-gray-800 shadow-sm z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {org.org_type === "restaurant" ? (
          <RestaurantDetailPopup restaurant={org} onCBOClick={onCBOIdSelect} />
        ) : (
          <CBODetailPopup cbo={org} cboData={cboData} />
        )}
      </div>
    </>
  );
}