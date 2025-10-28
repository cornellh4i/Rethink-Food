'use client'
import { useEffect, useState, useCallback } from "react";
import Map from "../components/Map";
import OrgList from "../components/OrgList";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { FilterProvider, useFilter } from "../context/FilterContext";
import MetricBar from "@/components/MetricBar";
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
  created_at?: string;
  updated_at?: string;
};

function HomeContent() {
  const { isFilterActive } = useFilter();
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

  return (
    <div className="flex flex-col h-screen">
      <MetricBar />

      <div className="flex flex-1 overflow-hidden mt-[32px] relative">
        {isFilterActive && (
          <div className="w-2/5 border-r border-gray-300 overflow-y-auto bg-gray-50 z-20">
            <div className="p-4">
              <OrgList
                onOrganizationSelect={(org) => {
                  setSelectedOrg(org);
                }}
              />
            </div>
          </div>
        )}

        <div className={isFilterActive ? "w-3/5 relative" : "w-full relative"}>
          <Map
            selectedOrg={selectedOrg}
          />
          <FilterBar />

          {selectedOrg && (
            <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-30">
              <OrganizationDetailPopup
                org={selectedOrg}
                onClose={() => setSelectedOrg(null)}
              />
            </div>
          )}
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
