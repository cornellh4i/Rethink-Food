'use client'
import { Organization } from "@/app/page";
import { X } from "lucide-react";
import RestaurantDetailPopup from "./RestaurantDetailPopup";
import CBODetailPopup from "./CBODetailPopup";
import { useEffect, useRef } from "react";

export default function OrganizationDetailPopup({
  org,
  onClose,
}: {
  org: Organization;
  onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

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
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {org.org_type === "restaurant" ? (
          <RestaurantDetailPopup restaurant={org} />
        ) : (
          <CBODetailPopup cbo={org} />
        )}
      </div>
    </>
  );
}