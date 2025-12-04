'use client'
import { useEffect, useState, useCallback } from "react";
import Map from "../components/Map";
import OrgList from "../components/OrgList";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { FilterProvider, useFilter } from "../context/FilterContext";
import FilterBar from "@/components/FilterBar";
import OrganizationDetailPopup from "@/components/OrganizationDetailPopup";

export type Organization = {
  id: number | string;
  name: string;
  org_type?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  borough?: string;
  area?: string;
  website?: string | null;
  number_of_meals?: number;
  meal_count?: number;
  created_at?: string;
  updated_at?: string;
  writeup?: string;
};

function HomeContent() {
  const { isFilterActive, closeSidebar, allDestinations } = useFilter();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserEmail(session?.user?.email || null)
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null)
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  }, []);

  useEffect(() => {
    setSelectedOrg(null);
  }, [isFilterActive]);

  const handleCBOIdSelect = (cboId: number) => {
    const fullCBOOrg = allDestinations.find(org => org.id === cboId);
    if (fullCBOOrg) {
      setSelectedOrg(fullCBOOrg);
    }
  };

  const handleRestaurantIdSelect = (restaurantId: number) => {
    const fullRestaurantOrg = allDestinations.find(org => org.id === restaurantId);
    if (fullRestaurantOrg) {
      setSelectedOrg(fullRestaurantOrg);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {isFilterActive && (
        <div className="w-full md:w-1/4 md:min-w-[250px] md:max-w-[400px] border-r border-gray-300 overflow-y-auto bg-gray-50 z-20 absolute md:relative h-full md:h-auto left-0 top-0">
          {/* Close button for sidebar */}
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg transition-colors z-50"
            aria-label="Close sidebar"
          >
            <img src="/close_sidebar.png" alt="Close sidebar" className="w-5 h-5" />
          </button>
          
          {/* Content starts below the FilterBar - FilterBar height + padding */}
          <div className="p-4" style={{ paddingTop: '100px' }}>
            <OrgList
              onOrganizationSelect={(org) => {
                setSelectedOrg(org);
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 relative min-w-0 w-full h-full">
        <Map 
          selectedOrg={selectedOrg}
          onOrganizationSelect={(org) => setSelectedOrg(org)}
        />

        {selectedOrg && (
          <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-30">
            <OrganizationDetailPopup
              org={selectedOrg}
              onClose={() => setSelectedOrg(null)}
              onCBOIdSelect={handleCBOIdSelect}
              onRestaurantIdSelect={handleRestaurantIdSelect}
            />
          </div>
        )}
      </div>

      <div className="absolute top-10 left-4 z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <FilterBar onOrganizationSelect={(org) => setSelectedOrg(org)} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <FilterProvider>
      <HomeContent />
    </FilterProvider>
  );
}